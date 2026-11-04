<template>
  <div v-if="student">
    <h1>{{ student.firstName }} {{ student.lastName }}</h1>

    <p>Filière : <input v-model="student.filiere" /></p>
    <p>Année : <input v-model.number="student.year" type="number" min="1" max="5" /></p>
    <p>Email : <input v-model="student.email" /></p>
  </div>
  <div v-else>
    <p>Étudiant introuvable.</p>
  </div>

  <button @click="$router.back()">Retour</button>
</template>

<script>
import { store } from '../store/students.js'

export default {
  name: 'StudentDetailView',
  computed: {
    student() {
      const id = Number(this.$route.params.id)
      return store.students.find(s => s.id === id)
    }
  }
}
</script>
