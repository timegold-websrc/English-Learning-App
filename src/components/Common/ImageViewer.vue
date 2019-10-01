<template>
  <div class="view_wrapper" :style="wrapperstyle" aria-hidden="true" @click="selectBookImage">
    <div v-if="imageUrl" style="width: 100%; height: 100%; ">
        <img class="img-fluid" :src="imageUrl" alt="Image" />
        <div v-if="!isMuted" class="text-center del_btn" @click="deleteImage">删除</div>
    </div>
    <div v-else>
        <div class="horizontal_line" :style="hLineStyle"></div>
        <div class="vertical_line" :style="vLineStyle"></div>
    </div>
    <input ref="fileUploader" type="file" style="position: absolute; top: -50px" @change="onFileChange">
  </div>
</template>

<script>
export default {
  name: 'imageviewer',
  props: {
    width: {
      type: Number,
      default: 120
    },
    height: {
        type: Number,
        default: 160
    },
    imageUrl: {
      type: String
    },
    isMuted: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    wrapperstyle () {
      const style = {
        width: `${this.width}px`,
        height: `${this.height}px`,
        position: 'relative'
      }
      return style
    },

    hLineStyle () {
      var lPos = (this.width - 70) / 2;
      const style = {
        height: '2px',
        width: '70px',
        top: '50%',
        left: `${lPos}px`
      }
      return style
    },

    vLineStyle () {
      var tPos = (this.height - 80) / 2;
      const style = {
        height: '80px',
        width: '2px',
        top: `${tPos}px`,
        left: '50%'
      }
        return style
    }
  },
  methods: {
    selectBookImage(e){
      if(this.isMuted){
        this.$emit('click', e);
      }else{
        e.stopPropagation();
        if(this.imageUrl) return;
        this.$refs.fileUploader.click();
      }
      
    },
    onFileChange(e){
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      
      var file = files[0]
      this.$emit('changedImage', file);
      this.$refs.fileUploader.value = null;
    },
    deleteImage(e){
      e.stopPropagation();
      this.$emit('changedImage', null);
    }
  },
}
</script>
<style>
  .view_wrapper{
    overflow: hidden; 
    border: 2px solid #5893D8;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
  }
  .view_wrapper .horizontal_line,
  .view_wrapper .vertical_line{
    background-color: #5893D8;
    position: absolute;
  }
  .view_wrapper .del_btn{
    position: absolute;
    bottom: 0px;
    width: 100%;
    color: white;
    background-color: #00000030;
    font-size: 14px;
  }
  .view_wrapper .del_btn:hover{
    background-color: #ff525290;
  }
</style>
