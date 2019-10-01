<template>
    <aside class="userview" :class="isShow ? '' : 'd-none'" @click="changeShow($event, true)">
        <div class="usersidebar" @click="changeShow($event, false)">
            <div class="container text-center pt-5 mb-5">
                <avatar username="" :size="140" :src="user_avatar ? $serverURL + user_avatar : 'img/user/dummy_user.jpg'" class="align-middle"/>
            </div>
            <div class="user-content mb-5 fn-20">
                <div class="mt-1 mb-1"><span class="mr-3">姓名:</span>{{user_name ? user_name : ''}}</div>
                <div class="mt-1 mb-1"><span class="mr-3">性别:</span>{{getUserSex}}</div>
                <div class="mt-1 mb-1"><span class="mr-3">班级:</span>{{user_class ? user_class : ''}}</div>

                <img class="img-prize" src="img/icons/prize.png" alt="Image" />
            </div>

            <div class="user-content fn-24">
                <div class="mt-2 mb-2" @click="changeShow($event, true)">
                    <img src="img/icons/course.png" class="icon-30 mr-3" alt="">
                    <router-link to="/course" >我的课程</router-link>
                </div>
                <div class="mt-2 mb-2" @click="changeShow($event, true)">
                    <img src="img/icons/homework.png" class="icon-30 mr-3" alt="">
                    <router-link to="/homework">我的作业</router-link>
                </div>
                <div class="mt-2 mb-2" @click="changeShow($event, true)">
                    <img src="img/icons/collect.png" class="icon-30 mr-3" alt="">
                    <router-link to="/collection">我的收藏</router-link>
                </div>
                <div class="mt-2 mb-2">
                    <img src="img/icons/logout.png" class="icon-30 mr-3" alt="">
                    <router-link to="/login">很出</router-link>
                </div>
            </div>
        </div>
    </aside>
</template>

<script>
    import Avatar from '@/components/Common/Avatar';
    export default {
        name: 'Usersidebar',
        components: {
            Avatar
        },
        props: {
            show: {
                default: false,
                type: Boolean
            }
        },
        data() {
            return {
                user_avatar: null,
                user_name: '',
                user_sex: '',
                user_class: ''
            }
        },
        computed: {
            isShow: function(){
                return this.show;
            },
            getUserSex: function(){
                if(!this.user_sex) return '';
                if(this.user_sex == 'male') return '男';
                else return '女';
            }
        },
        mounted() {
            this.user_avatar = this.$store.getters.getAvatar;
            this.user_name = this.$store.getters.getUserName;
            this.user_sex = this.$store.getters.getSex;
            this.user_class = this.$store.getters.getClassName;
        }, 
        methods: {
            changeShow(e, state){
                console.log(state)
                if(state) {
                    this.$parent.$emit('toggleUserBar');
                }else{
                    e.stopPropagation();
                    console.log('unhide')
                }
            }
        },
    }
</script>
<style>
    .usersidebar .avatar140{
        margin: auto;
        width: 140px!important;
        height: 140px!important;
        overflow: hidden;
        border-radius: 50%;
        border: 2px solid #d2d2d2;
    }
    .usersidebar .user-content{
        color: white;
        margin-left: 60px;
        position: relative;
    }
    .usersidebar .user-content a{
        color: white;
    }
    .img-prize{
        height: 65px;
        position: absolute;
        top: 10px;
        right: 40px;
    }
    .userview{
        background-color: #00000075;
        margin-top: 65px;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        /* margin-bottom: 140px; */
        z-index: 1000;
    }
    .usersidebar{
        width: 340px;
        background-color: #5a5a5a!important;
        float: right;
        height: 100%;
    }
</style>
