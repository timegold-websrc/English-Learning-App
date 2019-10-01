<template>
  <div class="avatar-wrapper" :style="wrapperstyle" aria-hidden="true">
    <div style="width: 100%; height: 100%; border-radius:50%; overflow: hidden; border: 2px solid #d2d2d2">
        <img class="img-fluid" :src="src" alt="Image" />
    </div>
    <div v-if="username" :style="style" style="width: 100%; position: absolute; text-align: center; color: white">
        <span :style="namestyle">{{username}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'avatar',
  props: {
    username: {
      type: String
    },
    size: {
      type: Number,
      default: 50
    },
    src: {
      type: String
    }
  },
  data () {
    return {
    }
  },
  computed: {
    wrapperstyle () {
      const style = {
        width: `${this.size}px`,
        height: `${this.size}px`,
        position: 'relative'
      }
      return style
    },

    style () {
      var fnSize = this.size * 0.1;
      const style = {
        bottom: `-${fnSize}px`
      }
      return style
    },

    namestyle () {
        var fnSize = this.size * 0.2;
        const style = {
            backgroundColor: '#0093ec',
            fontSize: `${fnSize}px`,
            borderRadius: '5px',
            padding: '1px 5px'
        }
        return style
    }
  }
}
</script>