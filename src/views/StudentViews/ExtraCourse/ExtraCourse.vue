<template>
    <ContentWrapper :unwrap = true>
        <!-- <div class="content-heading">Carousel</div> -->
        <b-carousel id="carousel1"
                    style="text-shadow: 1px 1px 2px #333;"
                    controls
                    indicators
                    background="#ababab"
                    :interval="2000"
                    img-width="1024"
                    img-height="480"
                    v-model="slide"
                    @sliding-start="onSlideStart"
                    @sliding-end="onSlideEnd">

            <!-- Text slides with image -->
            <b-carousel-slide caption="First slide"
                            text="Nulla vitae elit libero, a pharetra augue mollis interdum."
                            img-src="https://picsum.photos/1024/480/?image=52"
            ></b-carousel-slide>

            <!-- Slides with custom text -->
            <b-carousel-slide img-src="https://picsum.photos/1024/480/?image=54">
            <h1>Hello world!</h1>
            </b-carousel-slide>

            <!-- Slides with image only -->
            <b-carousel-slide img-src="https://picsum.photos/1024/480/?image=58">
            </b-carousel-slide>

            <!-- Slides with img slot -->
            <!-- Note the classes .d-block and .img-fluid to prevent browser default image alignment -->
            <b-carousel-slide>
            <img slot="img" class="d-block img-fluid w-100" width="1024" height="480"
                    src="https://picsum.photos/1024/480/?image=55" alt="image slot">
            </b-carousel-slide>

            <!-- Slide with blank fluid image to maintain slide aspect ratio -->
            <b-carousel-slide caption="Blank Image" img-blank img-alt="Blank image">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                eros felis, tincidunt a tincidunt eget, convallis vel est. Ut pellentesque
                ut lacus vel interdum.
            </p>
            </b-carousel-slide>

        </b-carousel>
        <div class="pannel pt-5 pb-3">
            <div class="pannel-header text-center mb-3">
                <div class="pannel-title">课外阅读</div>
                <div class="pannel-subtitle">Outside reading</div>
            </div>
            <div class="container pannel-body text-center">
                <div v-for="(item, index) in outbooks" v-bind:key="index" class="row home-item mb-4 mr-0 ml-0" >
                    <div class="col-2">
                        <img class="book-thumb-2" :src="item.book" alt="Image" />
                    </div>
                    <div class="col-10 text-left">
                        <h2 class="mb-2 mt-2">{{item.title}}</h2>
                        <h4 class="mb-2 text-muted">{{item.type}}</h4>
                        <p class="mb-2 text-muted">{{item.content}}</p>
                    </div>
                </div>
                <router-link to="/extracourse">
                    <button type="button" class="btn mr-1 mb-1 btn-primary fn-32 border-12">查看更多</button>
                </router-link>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                slide: 0,
                sliding: null,
                homeworks: [],
                books: [],
                outbooks: []
            }
        },
        mounted() {
            this.homeworks = [
                {id: 1, avatar: "img/user/01.jpg", t_name: '黄老师', deadline: '03/28/24: 00: 00', date: '2019/03/27'},
                {id: 2, avatar: "img/user/07.jpg", t_name: '张老师', deadline: '03/29/24: 00: 00', date: '2019/03/22'},
                {id: 3, avatar: "img/user/08.jpg", t_name: '李老师', deadline: '03/28/24: 00: 00', date: '2019/03/01'}
            ];

            this.books = [
                {id: 1, book: "img/book/book-1.jpg", t_name: '黄老师', grade: '一年级上册'},
                {id: 2, book: "img/book/book-2.jpg", t_name: '张老师', grade: '二年级上册'},
                {id: 3, book: "img/book/book-3.jpg", t_name: '李老师', grade: '三年级上册'}
            ];

            this.outbooks = [
                {id: 1, book: "img/book/book-2.jpg", title: '国际朗文', type: '周典', content: '宏伟的北京王府井希尔顿酒店位于王府井购物中心的中央地带,地理位置优越,距离国贸和复兴门商业区有20分钟车程,距离紫禁城、天安门广场和东方广场也仅有数步之遥,提供...'},
                {id: 2, book: "img/book/book-3.jpg", title: '国际朗文', type: '郭琪', content: '日本 东海 岐阜县 下吕市的酒店 水明馆酒店 (日式旅馆),下吕市(日本)优惠 信息&价格 设施 条款规定 预订须知 2,029条住客点评 现在就预订 ...'}
            ];
        },
        methods: {
            onSlideStart (slide) {
                this.sliding = true
            },
            onSlideEnd (slide) {
                this.sliding = false
            }
        }
    }
</script>
<style>
    .pannel.bg-1{
        background-color: #d4e8ff;
    }
    .pannel .pannel-header .pannel-title{
        font-size: 42px;
        font-weight: bold;
        color: black;
        line-height: 48px;
    }
    .pannel .pannel-header .pannel-subtitle{
        font-size: 18px;
        line-height: 20px;
    }

    .home-item{
        max-width: 1140px;
        color: black;
    }
    .book-thumb-1{
        height: 456px;
        width: 300px;
        border-radius: 10px;
    }
    .book-thumb-2{
        height: 200px;
        width: 132px;
        border-radius: 10px;
    }
    .border-12{
        border-radius: 12px;
    }
</style>