<template>
  <div>
    <v-btn fab dark small depressed :color="color[i % color.length]">
    {{word}}
    </v-btn>
  </div>
</template>

<script>
export default {
  props: ['i', 'word'],
  data() {
    return {
      color: [
        "primary",
        "pink",
        "indigo",
        "teal",
        "cyan",
        "purple"
      ]
    }
  }
}
</script>

