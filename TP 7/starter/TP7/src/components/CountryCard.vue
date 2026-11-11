<template>
  <router-link :to="`/pays/${country.alpha3Code}`" class="country-card">
    <img :src="country.flags.svg" :alt="`Drapeau ${country.name}`" />
    <h3>{{ country.name }}</h3>
    <p>{{ country.capital ? country.capital : '—' }}</p>
    <p>{{ country.region }} · {{ country.population.toLocaleString() }} hab.</p>
  </router-link>
</template>

<script>
export default {
  name: 'CountryCard',
  props: {
    country: { type: Object, required: true }
  }
}
</script>