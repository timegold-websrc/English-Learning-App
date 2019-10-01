<template>
    <footer class="footer-container">
        <div class="d-flex mr-5 ml-5 pt-2 pr-5 pl-5">
            <div  class="mr-auto flex-row">
                <div class="d-flex">
                    <router-link v-for="(link, index) in links" 
                        :key="index" 
                        :to="link.link" 
                        :title="link.name"
                        class="footer-link txt-white">
                        {{link.name}}
                    </router-link>
                </div>
                <div class="footer-link text-muted mt-2">Copyright ©2014-2019 Ekwing. All Rights Reserved.粤ICP备14042221号  粤公网安备 44011302000555号</div>
            </div>
            <div class="flex-row text-center">
                <img class="icon-72" src="img/icons/qrcode.png" alt="Image" />
                <div class="txt-white mt-1">扫码下载APP</div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    data() {
        return{
            links: []
        }
    },
    mounted() {
        var userRole = this.$store.getters.getRole;
        if(userRole == 'student'){
            this.links = [
                {name: '首页', link: '/home'},
                {name: '课程', link: '/course'},
                {name: '作业', link: '/homework'},
                // {name: '收藏本', link: '/collection'},
                // {name: '课外阅读', link: '/extracourse'},
                {name: '隐私协议', link: '/privacy'},
                {name: '了解更多', link: '/service'}
            ]
        }else if(userRole == 'guest'){
            this.links = [
                {name: '首页', link: '/home'},
                {name: '课外阅读', link: '/extracourse'},
                {name: '隐私协议', link: '/privacy'},
                {name: '了解更多', link: '/service'},
                {name: '注册账号', link: '/register'}
            ]
        }
    },
}
</script>
<style>
    .footer-container{
        background-color: #393939;
        height: 142px!important;
        margin-left: 0px!important;
    }
    .footer-container .footer-link{
            padding: 10px 20px;
    }
    .footer-container .txt-white{
        color: #D5D5D5;
    }

</style>
