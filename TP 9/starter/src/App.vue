<!--
  TP9 -- Meteo en direct.
  Le gabarit (template) est deja cable sur les donnees : il n'y a rien a
  modifier dans la partie template. Tout le travail est dans les methodes
  et la computed de la partie script, marquees TODO 1 a 6.
-->
<template>
  <div class="app">
    <header class="topbar">
      <h1>Météo en direct</h1>
      <button class="unit-toggle" @click="basculerUnite" v-if="ville">
        Afficher en {{ unite === 'metric' ? '°F' : '°C' }}
      </button>
    </header>

    <div class="search">
      <input
        v-model="query"
        @input="onInputRecherche"
        type="text"
        placeholder="Rechercher une ville... (ex: Safi, Paris, Tokyo)"
      />
      <p class="hint" v-if="chargementSuggestions">Recherche...</p>
      <p class="msg-error" v-if="erreurSuggestions">{{ erreurSuggestions }}</p>

      <ul class="suggestions" v-if="suggestions.length">
        <li v-for="s in suggestions" :key="s.lat + '-' + s.lon" @click="choisirVille(s)">
          {{ s.name }}<span v-if="s.state">, {{ s.state }}</span> ({{ s.country }})
        </li>
      </ul>
    </div>

    <div class="historique" v-if="historique.length">
      <span>Récent :</span>
      <button v-for="h in historique" :key="h.lat + '-' + h.lon" @click="choisirVille(h)">
        {{ h.name }}
      </button>
    </div>

    <div class="meteo" v-if="ville">
      <p class="loading" v-if="chargementMeteo">Chargement de la météo...</p>
      <p class="msg-error" v-else-if="erreurMeteo">{{ erreurMeteo }}</p>

      <div v-else-if="meteoActuelle" class="courante">
        <h2>{{ ville.name }}, {{ ville.country }}</h2>
        <div class="temp-actuelle">
          <img :src="iconeUrl(meteoActuelle.weather[0].icon)" :alt="meteoActuelle.weather[0].description" />
          <span class="valeur">{{ Math.round(meteoActuelle.main.temp) }}°</span>
          <span class="description">{{ meteoActuelle.weather[0].description }}</span>
        </div>
        <p class="details">
          Ressenti {{ Math.round(meteoActuelle.main.feels_like) }}° · Humidité {{ meteoActuelle.main.humidity }}%
        </p>
      </div>

      <div class="previsions" v-if="previsionsParJour.length">
        <div class="jour" v-for="j in previsionsParJour" :key="j.date">
          <span class="date">{{ j.date }}</span>
          <img :src="iconeUrl(j.icone)" :alt="j.description" />
          <span class="temps">{{ Math.round(j.min) }}° / {{ Math.round(j.max) }}°</span>
        </div>
      </div>
    </div>

    <p class="empty" v-if="!ville">Cherchez une ville pour voir sa météo.</p>
  </div>
</template>

<script>
// La cle est lue depuis .env (jamais committee -- voir .env.example et le sujet).
const API_KEY = import.meta.env.VITE_OWM_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

export default {
  name: 'App',
  data() {
    return {
      query: '',
      debounceTimer: null,
      suggestions: [],
      chargementSuggestions: false,
      erreurSuggestions: null,

      ville: null, // { name, country, state, lat, lon }
      historique: [],

      meteoActuelle: null,
      previsions: [], // tableau brut renvoye par /forecast (tranches de 3h)
      chargementMeteo: false,
      erreurMeteo: null,

      unite: 'metric' // 'metric' (°C) | 'imperial' (°F)
    }
  },
  computed: {
    previsionsParJour() {
      const jours = {}
      for (const p of this.previsions) {
        const date = p.dt_txt.split(' ')[0]
        const heure = Number(p.dt_txt.split(' ')[1].slice(0, 2))
        const ecart = Math.abs(heure - 12)
        if (!jours[date]) {
          jours[date] = {
            date: date,
            min: p.main.temp_min,
            max: p.main.temp_max,
            icone: p.weather[0].icon,
            description: p.weather[0].description,
            ecart: ecart
          }
        } else {
          const j = jours[date]
          if (p.main.temp_min < j.min) j.min = p.main.temp_min
          if (p.main.temp_max > j.max) j.max = p.main.temp_max
          if (ecart < j.ecart) {
            j.icone = p.weather[0].icon
            j.description = p.weather[0].description
            j.ecart = ecart
          }
        }
      }
      return Object.values(jours).sort((a, b) => a.date.localeCompare(b.date))
    }
  },
  methods: {
    iconeUrl(code) {
      return `https://openweathermap.org/img/wn/${code}@2x.png`
    },

    onInputRecherche() {
      clearTimeout(this.debounceTimer)
      if (this.query.trim() === '') {
        this.suggestions = []
        this.erreurSuggestions = null
        return
      }
      this.debounceTimer = setTimeout(() => {
        this.rechercherVilles()
      }, 400)
    },

    async rechercherVilles() {
      this.chargementSuggestions = true
      this.erreurSuggestions = null
      try {
        const url = `${GEO_URL}?q=${encodeURIComponent(this.query)}&limit=5&appid=${API_KEY}`
        const reponse = await fetch(url)
        if (reponse.status === 401) {
          this.suggestions = []
          this.erreurSuggestions = 'Clé API invalide ou absente.'
          return
        }
        if (reponse.status === 429) {
          this.suggestions = []
          this.erreurSuggestions = 'Quota dépassé, réessayez plus tard.'
          return
        }
        if (!reponse.ok) throw new Error('Erreur ' + reponse.status)
        const donnees = await reponse.json()
        this.suggestions = donnees
        if (donnees.length === 0) {
          this.erreurSuggestions = 'Aucune ville trouvée pour cette recherche.'
        }
      } catch (e) {
        this.suggestions = []
        this.erreurSuggestions = 'Erreur réseau, impossible de chercher la ville.'
      } finally {
        this.chargementSuggestions = false
      }
    },

    choisirVille(ville) {
      this.suggestions = []
      this.query = ''
      this.ville = ville
      const autres = this.historique.filter(h => h.lat !== ville.lat || h.lon !== ville.lon)
      autres.unshift(ville)
      this.historique = autres.slice(0, 5)
      this.chargerMeteo()
    },

    async chargerMeteo() {
      this.chargementMeteo = true
      this.erreurMeteo = null
      try {
        const lat = this.ville.lat
        const lon = this.ville.lon
        const url1 = `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
        const url2 = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
        const [rep1, rep2] = await Promise.all([fetch(url1), fetch(url2)])
        if (!rep1.ok || !rep2.ok) throw new Error('Erreur serveur')
        this.meteoActuelle = await rep1.json()
        const donnees = await rep2.json()
        this.previsions = donnees.list
      } catch (e) {
        this.meteoActuelle = null
        this.previsions = []
        this.erreurMeteo = 'Impossible de charger la météo.'
      } finally {
        this.chargementMeteo = false
      }
    },

    basculerUnite() {
      if (this.unite === 'metric') {
        this.unite = 'imperial'
      } else {
        this.unite = 'metric'
      }
      this.chargerMeteo()
    }
  }
}
</script>
