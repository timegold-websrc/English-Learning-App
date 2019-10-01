<template>
  <div ref="customSelect" class="custom_select_wrapper" :class="bordered">
    <input type="text" readonly
      :value="selectedItem ? selectedItem.name : ''"
      :placeholder="placeholdText"
      @blur="closeExtend"
      @click="toggleExtend">

    <ul v-if="extended" class="dropdown-list" style="max-height: 260px; overflow: auto">
      <li v-for="(item, index) in menus" :key="index" class="select_item" @mousedown="changeSelection(index)">{{item.name}}</li>
      <li v-if="!menus.length" class="select_item fn-muted" @click="closeExtend">—没有项目—</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'customselect',
  props: {
    placeholdText: {
      type: String
    },
    menus: {
      type: Array
    },
    bordered: {
      type: String,
      default: 'bordered'
    },
    value: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      extended: false,
      selectedItem: null
    }
  },
  watch: {
    menus: function(val){
      if(!val.length) this.selectedItem = null;
      if(this.selectedItem && !val.includes(this.selectedItem)) {
        this.selectedItem = null;
        this.$emit('changeSelection', null);
      }
    },
    value: function(val){
      if(!val) this.selectedItem = null;
      if(val == this.selectedItem) return;
      this.selectedItem = val;
    }
  },
  mounted() {
    if(this.value) this.selectedItem = this.value;
  },
  methods: {
    toggleExtend(e){
      this.extended = !this.extended;
    },
    changeSelection(index){
      this.selectedItem = this.menus[index];
      if(!this.selectedItem) this.selectedItem = null;
      
      this.$emit('changeSelection', this.selectedItem);
      this.extended = false;
    },
    closeExtend(){
      this.extended = false;
    }
  },
}
</script>
<style>
  .custom_select_wrapper{
    min-width: 120px;
    display: inline-block;
    width: 100%;
    font-weight: 400;
    color: #495057;
    vertical-align: middle;
    background: url(/img/icons/dropdown.png) no-repeat right 0.6rem center/14px 8px;
    background-color: #fff;
    border: 1px solid #dde6e9;
    border-radius: 0.25rem;
    position: relative;
    padding: 0px;
  }
  .custom_select_wrapper input{
    width: 100%;
    background: transparent;
    border: 0px;
    padding: 7px 40px 7px 8px;
    cursor: pointer;
  }
  .custom_select_wrapper.none{
    border-radius: 0px;
  }
  .custom_select_wrapper.bordered .select_btn{
    margin: 8px 16px;
    cursor: pointer;
  }
  .custom_select_wrapper.none .select_btn{
    margin: 0px 16px;
    cursor: pointer;
  }
  .custom_select_wrapper .dropdown-list{
    position: absolute;
    background-color: white;
    width: 100%;
    list-style: none;
    padding: 0px;
    outline: 1px solid #E8E8E8;
    z-index: 1000;
    margin-top: -2px;
    text-align: center;
  }
  .select_item{
    cursor: pointer;
    padding: 8px 0px;
    margin: -1px 10px;
    border-bottom: 1px solid #E8E8E8;
    color: #5B5B5B;
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer */
    -khtml-user-select: none; /* KHTML browsers (e.g. Konqueror) */
    -webkit-user-select: none; /* Chrome, Safari, and Opera */
    -webkit-touch-callout: none; /* Disable Android and iOS callouts*/
  }
  .select_item:hover{
    color: black;
  }
</style>
