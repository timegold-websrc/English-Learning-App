<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18 align-items-center">
                <router-link to="/teacher/class" class="link-primary mr-1">班级</router-link> >  
                <span class="ml-1">{{className}}</span>
            </div>
            <div class="row mr-0 ml-0 fn-20 text-center">
                <div class="col-md-6 bordered_tab_item fn-muted" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">课程</div>
                <div class="col-md-6 bordered_tab_item fn-muted" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">学生</div>
            </div>
            <table v-if="selectedTabID == 0" class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">课程图片</th>
                        <th  class="fn-18 fn-black fn-bold-none">课程名称</th>
                        <th  class="fn-18 fn-black fn-bold-none">任课老师</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td><image-viewer class="m-auto" :imageUrl="getBookImg(item.course_img)" :width="90" :height="120" :isMuted="true"/></td>
                        <td>{{item.name}}</td>
                        <td>{{item.teacher.name}}</td>
                    </tr>
                </tbody>
            </table>
            <table v-else class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">姓名</th>
                        <th  class="fn-18 fn-black fn-bold-none">电话</th>
                        <th  class="fn-18 fn-black fn-bold-none">监护人</th>
                        <th  class="fn-18 fn-black fn-bold-none">详情</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td>{{item.name}}</td>
                        <td>{{item.phone}}</td>
                        <td>{{item.guardian}}</td>
                        <td class="fn-info cursor-pointer" @click="viewStudentInfos(index)">查看</td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="selectedList.length" v-model="currentPage" :per-page="10"></b-pagination>
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
                classID: 0,
                className: '',
                studentList: [],
                courseList: [],
                
                currentPage: 0,
                selectedTabID: 0,
                selectedList: [],
                tmpData: []
            }
        },
        computed: {
            
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.classID = this.$route.query.id;
            this.className = this.$route.query.name;
            this.initCourseData();
        },
        methods: {
            initCourseData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/coursesInClass/' + this.classID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.courseList = response.data;
                        _this.selectedList = _this.courseList;
                        console.log(response.data);
                        _this.fliterPageData();
                    })
            },
            initStudentData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/students/' + this.classID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.studentList = response.data;
                        _this.selectedList = _this.studentList;
                        console.log(response.data);
                        _this.fliterPageData();
                    })
            },
            selectTab(index){
                if(this.selectedTabID == index) return;
                 

                this.selectedTabID = index;
                this.currentPage = 1;
                if(index && !this.studentList.length) this.initStudentData();
                else this.fliterPageData();
            },
            fliterPageData(){
                if(this.selectedTabID == 0) this.selectedList = this.courseList;
                else this.selectedList = this.studentList;

                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.selectedList.slice(offset, offset + 10);
            },
            viewStudentInfos(index){
                this.$router.push({path:'/teacher/student/student_info', query: {path: ['班级', this.className], id: this.tmpData[index].id}});
            },
            getBookImg: function(img){
                if(img) return this.$serverURL + img;
                else return 'img/dummy.png'
            }
        }
    }
</script>
<style>
    .bordered_tab_item{
        line-height: 46px;
        border: 1px solid #F0F0F0;
        border-bottom: 0px;
        cursor: pointer;
    }
    .bordered_tab_item.active{
        background-color: #5C99E1;
        border: 1px solid #5C99E1;
        color: white!important;
    }
</style>
