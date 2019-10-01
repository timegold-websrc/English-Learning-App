<template>
    <ContentWrapper>
        <div class="card ml-0 p-4">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/homework" class="link-primary">总课程</router-link> > 
                    课程作业
                </div>
                <button type="button" class="flex-row btn btn-outline-primary" @click="addHomework">添加作业</button>
            </div>
            <div class="border_2_muted radius_4">
                <div class="row mr-0 ml-0 fn-20 text-center">
                    <div class="col-md-12 tab_item_left pt-2 pb-2" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">课程作业</div>
                    <!-- <div class="col-md-6 tab_item_right pt-2 pb-2" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">自定义作业</div> -->
                </div>
                <div v-for="(item, index) in tmpData" :key="index" class="d-flex fn-16 border_t_2_muted ml-2 mr-2 pr-4 pl-4 pt-2 pb-2">
                    <div class="flex-row mr-auto cursor-pointer" @click="viewHomework(index)">
                        {{item.name}}
                        ( <span>{{item.scope}}</span> )
                    </div>
                    <div class="flex-row fn-danger cursor-pointer" @click="deleteHomework(index)">删除</div>
                </div>
            </div>
            
            
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="selectedTabID ? selfList.length : homeworkList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import ImageViewer from '@/components/Common/ImageViewer'
    export default {
        components: {
            ImageViewer
        },
        data () {
            return {
                homeworkList: [],
                selfList: [],
                currentPage: 0,
                tmpData: [],
                selectedTabID: 0
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.selfList = [
                    {id: 1, name: '雪国王子'},
                    {id: 2, name: '雪国王子'},
                    {id: 3, name: '雪国王子'},
                    {id: 4, name: '雪国王子'},
                    {id: 5, name: '雪国王子'},
                    {id: 6, name: '雪国王子'},
                    {id: 7, name: '雪国王子'}
                ];
            
            this.initCourseData();
        },
        methods: {
            initCourseData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/homeworks', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        console.log(response.data);
                        _this.homeworkList = response.data;
                        _this.fliterPageData();
                    })
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                
                if(this.selectedTabID) this.tmpData = this.selfList.slice(offset, offset + 10);
                else this.tmpData = this.homeworkList.slice(offset, offset + 10);
            },
            selectTab(index){
                this.selectedTabID = index;
                this.currentPage = 1;
                this.fliterPageData();
            },
            addHomework(){
                if(this.selectedTabID) this.$router.push('/teacher/homework/self_homework');
                else this.$router.push({path: '/teacher/homework/homeworksInCourse', query: {isPublished: 0}});
            },
            viewHomework(index){
                if(this.selectedTabID) this.$router.push({path:'/teacher/homework/self_homework', query: {id: this.tmpData[index].id}});
                else this.$router.push({path:'/teacher/homework/homeworksInCourse', query: {isPublished: 1, lesson: this.tmpData[index].lesson_id, id: this.tmpData[index].id}});
            },
            deleteHomework(index){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.delete(this.$serverURL + '/api/teachers/deleteHomework/' + this.tmpData[index].id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.initCourseData();
                    })
            }
        }
    }
</script>
<style>
    .tab_item_left{
        border-top-left-radius: 4px;
        margin: -1px 0px;
        cursor: pointer;
    }
    .tab_item_right{
        border-top-right-radius: 4px;
        margin: -1px 0px;
        cursor: pointer;
    }
    .tab_item_left.active,
    .tab_item_right.active{
        background-color: #5C99E1;
        color: white;
    }
</style>
