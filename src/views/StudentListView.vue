<template>
  <h1>Annuaire des étudiants</h1>

  <form @submit.prevent="ajouterEtudiant">
    <input v-model="newStudent.firstName" placeholder="Prénom" />
    <input v-model="newStudent.lastName" placeholder="Nom" />
    <input v-model="newStudent.filiere" placeholder="Filière" />
    <input v-model.number="newStudent.year" type="number" min="1" max="5" />
    <input v-model="newStudent.email" placeholder="Email" />
    <button type="submit">Ajouter</button>
  </form>

  <div class="toolbar">
    <input v-model="recherche" placeholder="Rechercher un nom ou prénom" />
    <select v-model="tri">
      <option value="lastName">Trier par nom</option>
      <option value="filiere">Trier par filière</option>
    </select>
  </div>

  <StudentCard v-for="student in etudiantsAffiches" :key="student.id" :student="student" />
</template>

<script>
import StudentCard from '../components/StudentCard.vue'
import { store } from '../store/students.js'

export default {
  name: 'StudentListView',
  components: { StudentCard },
  data() {
    return {
      store,
      recherche: '',
      tri: 'lastName',
      newStudent: { firstName: '', lastName: '', filiere: '', year: 1, email: '' }
    }
  },
  computed: {
    etudiantsAffiches() {
      const texte = this.recherche.toLowerCase()
      const resultat = this.store.students.filter(s =>
        s.firstName.toLowerCase().includes(texte) ||
        s.lastName.toLowerCase().includes(texte)
      )
      return resultat.sort((a, b) => a[this.tri].localeCompare(b[this.tri]))
    }
  },
  methods: {
    ajouterEtudiant() {
      if (this.newStudent.firstName.trim() === '' || this.newStudent.lastName.trim() === '') {
        return
      }
      this.store.students.push({
        id: this.store.students.length + 1,
        firstName: this.newStudent.firstName,
        lastName: this.newStudent.lastName,
        filiere: this.newStudent.filiere,
        year: this.newStudent.year,
        email: this.newStudent.email
      })
      this.newStudent = { firstName: '', lastName: '', filiere: '', year: 1, email: '' }
    }
  }
}
</script>
