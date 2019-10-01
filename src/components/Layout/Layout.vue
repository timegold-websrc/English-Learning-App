<template>
    <div class="wrapper">
        <!-- top navbar-->
        <Header :hasSideMenu="isTeacher ? true : false"/>
        <!-- offsidebar-->
        <!-- <Usersidebar  v-if="getRole == 'student'" :show="isShowUserSidebar"/> -->

        <!-- sideMenu-->
        <Sidebar v-if="isTeacher"/>

        <!-- Main section-->
        <section class="section-container" :class="isTeacher ? 'tea' : 'std'">
            <!-- Page content-->
            <router-view/>
        </section>
        <!-- Page footer-->
        <Footer  v-if="!isTeacher"/>
    </div>
</template>

<script>
    import 'loaders.css/loaders.css';
    import 'spinkit/css/spinkit.css';
    import Vue from 'vue';
    import Header from './Header'
    import Sidebar from './Sidebar'
    import Usersidebar from './Usersidebar'
    import Footer from './Footer'
    import ContentWrapper from './ContentWrapper'

    Vue.component('ContentWrapper', ContentWrapper)

    export default {
        name: 'Layout',
        components: {
            Header,
            Sidebar,
            Usersidebar,
            Footer
        },
        data(){
            return {
                isTeacher: false
            }
        }, 
        // computed: {
        //     getRole: function(){
        //         return this.$store.getters.getRole;
        //     }
        // },
        created(){
            var role = this.$store.getters.getRole;
            if(role == 'admin' || role == 'teacher') this.isTeacher = true;
            else this.isTeacher = false;
            // this.$on('toggleUserBar', function(){
            //     this.isShowUserSidebar = !this.isShowUserSidebar;
            // })
        }
    }
</script>
<style>
    .wrapper{
        background-color: #F3F3F3;   
    }
    .wrapper .section-container.tea{
        margin-left: 280px;
        height: calc(100% - 60px);
        margin-bottom: 0px!important;
    }
    .wrapper .section-container.std{
        margin-left: 0px!important;
    }
    .wrapper .section-container .content-wrapper{
        padding: 32px 40px;
        background-color: #F3F3F3;
        height: 100%;
    }
    .wrapper .section-container.std .content-wrapper{
        padding: 12px 40px;
    }
    .wrapper.muted{
        overflow: hidden;
        height: 100%;
    }
    
    .wrapper .section-container .unwrap{
        margin: -32px -40px;
    }
</style>
