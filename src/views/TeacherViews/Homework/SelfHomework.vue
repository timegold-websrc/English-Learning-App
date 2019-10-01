<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">总课程 > 自定义作业 > 编辑作业</div>
                <button type="button" class="btn btn-primary mr-4" @click="backToBefore(true)">确定</button>
                <button type="button" class="btn border_1_muted" @click="backToBefore(false)">取消</button>
            </div>
            <div class="border_2_muted">
                <div class="d-flex mr-0 ml-0 fn-18 text-center border_b_2_muted">
                    <div class="tab_item" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">文章</div>
                    <div class="tab_item" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">音频</div>
                    <div class="tab_item" :class="selectedTabID == 2 ? 'active' : ''" @click="selectTab(2)">视频</div>
                </div>
                <div class="p-3 fn-16 d-flex">
                    <div class="width_85">标<span class="space-48"></span>题</div>
                    <div class="flex width-full pl-4">
                        <div class="shadow_pannel pl-3 pr-3">
                            <input type="text" class="width-full" style="border: none">
                        </div>
                    </div>
                </div>
                <div class="p-3 fn-16 d-flex">
                    <div class="width_85">内<span class="space-48"></span>容</div>
                    <div class="flex width-full pl-4">
                        <div class="shadow_pannel">
                            <div class="shadow_pannel_header pr-3 pl-3 d-flex">
                                <div class="flex-row mr-auto text-muted">浏览</div>
                            </div>
                            <div v-if="selectedTabID == 0" class="ml-4 mr-4 pt-2 fn-18">
                                <div v-for="(item, index) in tmpData" :key="index" class="d-flex radius_4 mt-3 pr-2 pl-3 content_item">
                                    <div class="mr-4">{{item.title}}</div>
                                    <div class="fn-primary mr-4">在内容显示</div>
                                    <div class="fn-primary">删除</div>
                                </div>
                            </div>
                            <div v-else-if="selectedTabID == 1" class="ml-4 mr-4 pt-2 fn-18">
                                <div v-for="(item, index) in tmpData" :key="index" class="d-flex radius_4 mt-3 pr-2 pl-3 content_item align-items-center">
                                    <img class="img-fluid icon-small mr-2" src="/img/icons/play_active.png"/>
                                    <div class="mr-4">{{item.title}}</div>
                                    <div class="fn-primary mr-4">在内容显示</div>
                                    <div class="fn-primary">删除</div>
                                </div>
                            </div>
                            <div v-else class="ml-4 mr-4 pt-2 fn-18">
                                <div v-for="(item, index) in tmpData" :key="index" class="d-flex mt-3 pr-2 pl-3 align-items-baseline border_b_1_muted">
                                    <img class="img-fluid mr-2" src="/img/book/book-2.jpg" style="width: 180px; height: 120px">
                                    <div class="fn-primary ml-4">删除</div>
                                </div>
                            </div>
                            <div class="pr-3 pl-3 mt-3 d-flex align-items-center flex-end">
                                <div>截止时间：</div>
                                <datetime 
                                    type="datetime"
                                    v-model="datetime"
                                    :inputStyle="{border: 'none', width: '184px', cursor: 'pointer', background: 'transparent'}"
                                    format="yyyy/MM/dd HH:mm:ss"
                                    style="z-index: 10"></datetime>
                                <img src="img/icons/calendar.png" class="icon-small" alt="" style="z-index: 0; margin-left: -20px">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import ImageViewer from '@/components/Common/ImageViewer'
    import Datetime from '@/components/DateTime/Datetime'
    export default {
        components: {
            ImageViewer,
            Datetime
        },
        data () {
            return {
                sentences: [],
                tmpData: [],
                selectedTabID: 0,
                datetime: ''
            }
        },
        mounted() {
            var d = new Date();
            this.datetime = d.toISOString();

            this.sentences = [
                    {id: 1, title: '雪国狮子', content: 'content, content, content, content, content, content, content, content, content, content, content, content, '},
                    {id: 1, title: '雪国狮子', content: 'content, content, content, content, content, content, content, content, content, content, content, content, '},
                    {id: 1, title: '雪国狮子', content: 'content, content, content, content, content, content, content, content, content, content, content, content, '}
                ];

            this.initCourseData();
        },
        methods: {
            initCourseData(){
                this.fliterData();
            },
            fliterData(){
                this.tmpData = this.sentences;
                console.log(this.tmpData);
            },
            selectTab(index){
                this.selectedTabID = index;
            },
            addContent(){
                this.$router.push('/teacher/editSenteces');
            },
            backToBefore(isSave){
                if(!isSave) this.$router.push('/teacher/homeworkview');
                else{
                    console.log('save to server the changes');
                    this.$router.push('/teacher/homeworkview');
                }
            }
        }
    }
</script>
<style>
    .shadow_pannel{
        box-shadow: 0px 4px 8px #00000020;
        border-radius: 4px;
        line-height: 40px;
    }
    .shadow_pannel_header{
        background-color: #F3F3F3;
        box-shadow: 0px 2px 4px #00000020;
    }
    .content_item{
        background-color: #DEDEDE;
    }
    .sentence_editor{
        width: 100%;
        border: 0px;
        margin-top: 5px;
    }
    .width_85{
        width: 85px;
    }
    .h-fixed-300{
        height: 300px;
        overflow: auto;
    }
</style>
