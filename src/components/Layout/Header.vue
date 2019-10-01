<template>
    <header class="topnavbar-wrapper">
        <nav class="navbar topnavbar">

            <div class="navbar-header" :class="hasSideMenu ? 'hasSideMenu' : ''">
                <a class="navbar-brand" href="#/">
                    <div class="brand-logo">
                        <div class="mr-3"><img class="img-fluid" src="favicon.png" alt="App Logo"></div>
                        <div class="fn-30 fn-bold">iTeacher</div>
                    </div>
                </a>
            </div>

            <ul v-if="!hasSideMenu" class="navbar-nav mr-auto flex-row">
                <li v-for="(menuItem, index) in menuList" :key="index" class="nav-item d-none d-md-block">
                    <router-link class="nav-link menu-link" :to="menuItem.link" title="Home">{{menuItem.name}}</router-link>
                </li>
            </ul>

            <ul v-if="hasSideMenu" class="navbar-nav flex-row mr-4">
                <li class="nav-item">
                    <router-link to="/teacher/settings" class="nav-link d-flex align-items-center">
                        <img class="img-fluid icon-19 mr-2" src="img/icons/user.png" >
                        <span class="fn-info">{{getUserName}}</span>
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link fn-18 fn-primary" to="/teacher/login">退出</router-link>
                    <!-- <a href="/teacher/login" class="nav-link fn-18 fn-primary">
                        退出
                    </a> -->
                </li>
            </ul>

            <ul v-else class="navbar-nav flex-row mr-4">
                <!-- <li class="nav-item">
                    <a class="nav-link" href="#" data-search-open="">
                        <em class="icon-magnifier fn-black"></em>
                    </a>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link d-flex" :to="{path: '/messages', query: {news: newsCount}}">
                        <img v-if="newsCount" src="/img/icons/notice_active.png" class="icon-19" alt="">
                        <img v-else src="/img/icons/notice.png" class="icon-19" alt="">
                    </router-link>
                </li> -->
                <li class="nav-item">
                    <router-link v-if="getUserName" to="/settings" class="nav-link d-flex align-items-center" style="border-bottom: 0px!important">
                        <img src="/img/icons/user.png" class="icon-19 mr-2" alt="">
                        <span class="fn-info">{{getUserName}}</span>
                    </router-link>
                    <router-link v-else to="/login" class="nav-link d-flex align-items-center" style="border-bottom: 0px!important">
                        <img src="/img/icons/user_mute.png" class="icon-19 mr-2" alt="">
                        <span>登录</span>
                    </router-link>
                </li>
            </ul>

            <HeaderSearch />
        </nav>
        <!-- END Top Navbar-->
    </header>
</template>

<script>
    import axios from 'axios';
    import HeaderSearch from '@/components/Layout/HeaderSearch'

    export default {
        name: 'Header',
        components: {
            HeaderSearch
        },
        props: {
            hasSideMenu: Boolean
        },
        data() {
            return {
                newsCount: 0,
                intervalID: null,
                menuList: []
            }
        },
        created() {
        },
        mounted() {
            var userRole = this.$store.getters.getRole;

            if(userRole == 'student'){
                this.menuList = [
                    {name: '首页',      link: '/home' },
                    {name: '课程',      link: '/course' },
                    {name: '作业',      link: '/homework' }
                    // {name: '收藏本',    link: '/collection' },
                    // {name: '课外阅读',  link: '/extracourse' }
                ];

                // this.checkMessageStatus();
                // this.intervalID = setInterval(this.checkMessageStatus, 10000);
            }else if(userRole == 'guest'){
                this.menuList = [
                    {name: '首页',      link: '/home' },
                    {name: '课外阅读',  link: '/extracourse' }
                ];
            }
        },
        beforeDestroy(){
            if(this.intervalID) {
                clearInterval(this.intervalID);
                this.intervalID = null;
            }
        },
        watch: {
            $route: function(val){
                if(val.path == '/messages') this.newsCount = Number(val.query.news);
            }
        },
        computed: {
            getUserName: function(){
                return this.$store.getters.getUserName;
            }
        },
        methods: {
            // toggleUsersidebar() {
            //     this.$parent.$emit('toggleUserBar');
            // },
            checkMessageStatus(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/messageStatus', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        var count = resData.un_read;

                        if(_this.$route.path == '/messages'){
                            _this.$router.push({path: '/messages', query: {news: count}})
                        }else _this.newsCount = count;
                    })
            }
        }
    }
</script>
<style>
    .nav-item .nav-link.top-badge{
        position: relative;
    }
    .nav-item .nav-link.top-badge .badge{
        position: absolute;
        top: 10px;
        right: 0;
        padding: 2px 5px;
    }
    .topnavbar .navbar-nav > .nav-item > .nav-link{
        color: #A1A1A1;
        font-size: 18px;
        height: 60px;
    }
    .topnavbar{
        background-color: #FFFFFF;
        background-image: none;
        height: 60px;
        box-shadow: 0px 2px 4px #00000006;
    }
    .topnavbar .navbar-header{
        width: 280px;
        height: 100%;
        /* background-color: #031120; */
    }
    .topnavbar .navbar-header .navbar-brand{
        padding: 0px;
        margin: 0px;
    }
    .topnavbar .navbar-header .navbar-brand .brand-logo{
        display: flex;
        color: #1E1E1E;
        width: 100%;
        padding: 10px 40px;
    }
    .topnavbar .navbar-nav .nav-item .router-link-active,
    .topnavbar .navbar-nav .nav-item .menu-link.active{
        color: black!important;
        border-bottom: 2px solid #5C99E1;
    }

    .topnavbar .navbar-header.hasSideMenu{
        background-color: #031120;
    }
    .topnavbar .navbar-header.hasSideMenu .navbar-brand .brand-logo{
        color: white;
    }
</style>
