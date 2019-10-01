<template>
    <aside class="aside-container">
        <!-- START Sidebar (left)-->
        <div class="aside-inner">
            <nav class="sidebar" data-sidebar-anyclick-close="">
                <!-- START sidebar nav-->
                <ul class="sidebar-nav">
                    <li v-for="(menuItem, index) in menuList" :key="index" @click="activeMenuID = index">
                        <router-link :to="menuItem.link" class="d-flex align-items-center fn-18 menu_item" :class="activeMenuID == index ? 'active' : ''">
                            <img :src="activeMenuID == index ? menuItem.icon + '_active.png' : menuItem.icon + '.png'" alt="" class="icon-width-28 mr-3">
                            <div>{{menuItem.name}}</div>
                            <div v-if="menuItem.name == '学生' && isWaitingStd" class="ml-1" style="width: 12px; height: 12px; border-radius: 50%; background-color: red"></div>
                            <!-- <div>sdfsf</div> -->
                        </router-link>
                        
                    </li>
                </ul>
                
                <!-- END sidebar nav-->
            </nav>
        </div>
        <!-- END Sidebar (left)-->
    </aside>
</template>

<script>

    // import { mapState } from 'vuex';
    // import SidebarRun from './Sidebar.run.js';
    import axios from 'axios';

    export default {
        name: 'Sidebar',
        data() {
            return {
                menuList: [],
                activeMenuID: 0,

                tRole: null,
                timerID: null,
                isWaitingStd: false
            }
        },
        mounted() {
            this.tRole = this.$store.getters.getRole;
            if(this.tRole == 'admin'){
                this.menuList = [{icon: 'img/menuIcons/course',      name: '课程',       link: '/teacher/course'}]
            }else{
                this.menuList = [
                    // {icon: 'img/menuIcons/dashboard',   name: '数据面板',   link: '/teacher/dashboard'},
                    {icon: 'img/menuIcons/course',      name: '课程',       link: '/teacher/course'},
                    // {icon: 'img/menuIcons/book',        name: '教材库',     link: '/teacher/books' },
                    {icon: 'img/menuIcons/homework',    name: '作业',       link: '/teacher/homework'},
                    {icon: 'img/menuIcons/class',       name: '班级',       link: '/teacher/class'},
                    {icon: 'img/menuIcons/student',     name: '学生',       link: '/teacher/student'}];
                
                this.checkStudentEntryStatus();
                this.timerID = setInterval(this.checkStudentEntryStatus, 10000);
            }
            
            this.setCurrentMenu();
        },
        beforeDestroy() {
            if(this.timerID) {
                clearInterval(this.timerID);
                this.timerID = null;
            }
        },
        watch:{
            $route: function(val){ this.setCurrentMenu(); }
        },
        methods: {
            setCurrentMenu(){
                let cur_path = this.$route.path;
                for(var index in this.menuList){
                    let link = this.menuList[index].link;
                    if(cur_path.indexOf(link) == 0){
                        this.activeMenuID = index;
                        break;
                    }
                }
            },
            checkStudentEntryStatus(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/waitingStdCount', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        if(response.data.count) _this.isWaitingStd = true;
                        else _this.isWaitingStd = false;
                    })
            }
        }
    }
</script>
<style>
    .wrapper .aside-container,
    .wrapper .aside-container .aside-inner{
        width: 280px!important;
        background-color: #031120;
    }
    .wrapper .aside-container .aside-inner .sidebar{
        background-color: #031120;
    }
    .wrapper .aside-container .icon-width-28{
        width: 28px;
    }
    .menu_item{
        color: #9B9B9B!important;
        padding: 16px 70px!important;
    }
    .menu_item.active{
        color: white!important;
        background-color: #01070F;
    }
    .wrapper .aside-container .aside-inner{
        padding-top: 65px;
    }
</style>
