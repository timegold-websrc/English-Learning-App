<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/course" class="link-primary ml-1">课程</router-link> > 
            <span v-for="(parent, index) in parents" :key="index" @click="$router.go(-1)" class="link-primary cursor-pointer"> {{parents[index]}} > </span> 
            <span>{{lessonName}}</span> 
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-4 pl-0">
                <div class="card fn-14">
                    <div v-if="lessonData" class="row m-0 text-center pt-3 pb-3">
                        <div class="col-4 p-0 m-0">
                            <p>授课老师</p>
                            <div class="mb-0 fn-12 d-flex flex-center align-items-center">
                                <img src="img/icons/user_mute.png" class="icon-12 mr-1" alt="">
                                {{lessonData.t_name}}
                            </div>
                            <div class="separate">|</div>
                        </div>
                        <div class="col-4 p-0 m-0">
                            <p>总得分</p>
                            <p class="m-0">{{lessonData.t_marks}}分</p>
                            <!-- <p v-if="lessonData.progress > 80" class="m-0 fn-success">{{lessonData.progress}}分</p>
                            <p v-else-if="lessonData.progress > 60" class="m-0 fn-warning">{{lessonData.progress}}分</p>
                            <p v-else class="mb-0 fn-danger">{{lessonData.progress}}分</p> -->
                            <div class="separate">|</div>
                        </div>
                        <div class="col-4 p-0 m-0">
                            <p>总条数</p>
                            <p  class="m-0 fn-12">{{readSen.length + unReadSen.length}}条</p>
                        </div>
                    </div>
                </div>
                <div class="card pt-3 pb-3 mb-0">
                    <div class="row tab-header text-center ml-0 mr-0 mb-2 fn-16">
                        <div class="col-4 tab-item" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">全部</div>
                        <div class="col-4 tab-item" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">已读</div>
                        <div class="col-4 tab-item" :class="selectedTabID == 2 ? 'active' : ''" @click="selectTab(2)">未读</div>
                    </div>
                    <div style="max-height: 516px; overflow: auto">
                        <div v-for="(item, index) in tmpData" 
                            :key="index"
                            :class="sentenceIndex == index ? 'active' : ''"
                            @click="selectSentence(index)"
                            class="d-flex align-items-center p-2 sentence">
                            <div class="mr-auto fn-14">{{item.text}}</div>
                            <div class="flex-shrink-0 fn-12">
                                <span v-if="item.status" class="fn-success">已读</span>
                                <span v-else  class="fn-danger">未读</span>

                                <span class="ml-3"><img src="img/icons/record.png" alt="record" class="icon-small"> </span>
                                <span class="ml-3">
                                    <img :src="item.like ? 'img/icons/love_active.png' : 'img/icons/love.png'" 
                                        alt="record"
                                        class="icon-small">
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card col-8 p-4">
                <play-board 
                    :sentenceData="tmpData[sentenceIndex]" 
                    @changeResult="updateSentenceResult"
                    @changeLike="setLike(sentenceIndex)"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _LESSON_ = 1;
    
    import axios from 'axios';
    import PlayBoard from '@/components/Common/PlayBoard';
    export default {
        components: {
            PlayBoard
        },
        data () {
            return {
                selectedTabID: 0,
                sentenceIndex: 0,
                parents: [],
                lessonId: null,
                lessonName: null,
                lessonData: null,
                readSen: [],
                unReadSen: [],
                tmpData: []
            }
        },
        mounted() {
            this.parents = this.$route.query.paths;
            this.lessonId = this.$route.query.id;
            this.lessonName = this.$route.query.name;
            
            this.selectTab(0);
            this.initLessonData();
        },
        methods: {
            initLessonData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/lesson/' + this.lessonId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        console.log(resData);
                        var lesson = resData[0];
                        _this.lessonData = {
                            t_id: lesson.course.teacher_id,
                            t_name: lesson.course.teacher.name,
                            progress: lesson.lesson_results.length? lesson.lesson_results[0].avg_marks : 0
                        }
                        // console.log(_this.lessonData);
                        _this.readSen = [];
                        _this.unReadSen = [];
                        var t_marks = 0;
                        var sentences = resData[1];
                        for(var index in sentences){
                            var sentence = sentences[index];
                            if(sentence.student_results.length) {
                                var result = sentence.student_results[0];
                                if(result.marks) {
                                    sentence.status = true;
                                    _this.readSen.push(sentence);
                                    t_marks += result.marks;
                                }else{ 
                                    sentence.status = false;
                                    _this.unReadSen.push(sentence);
                                }

                                sentence.like = result.heart;  
                            }else{
                                sentence.status = 0;
                                sentence.like = false;
                                _this.unReadSen.push(sentence);
                            } 
                        }
                        
                        _this.lessonData['t_marks'] = t_marks;
                        _this.filterData();
                    })
            },
            selectTab(id){
                this.selectSentence(0);
                this.selectedTabID = id;
                this.filterData();
            },
            selectSentence(index){
                this.sentenceIndex = index;
            },
            filterData(){
                if(!this.lessonData) return;
                
                this.tmpData = [];
                if(this.selectedTabID == 0) this.tmpData = this.unReadSen.concat(this.readSen);
                else if(this.selectedTabID == 1) this.tmpData = this.readSen;
                else this.tmpData = this.unReadSen;
                
            },
            setLike(index){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.tmpData[index].id;
                var isLike = !this.tmpData[index].like;
                axios.put(this.$serverURL + '/api/students/setLike/' + sentence_id, {isHeart: isLike}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.tmpData[index].like = isLike;
                        _this.filterData();
                    })
            },
            updateSentenceResult(data){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.tmpData[this.sentenceIndex].id;
                axios.put(this.$serverURL + '/api/students/updateResultInCourse/' + sentence_id, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        console.log(data);
                        _this.initLessonData();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['课程', this.parents[0] + ' > ' + this.parents[1], this.lessonName] , tid: this.lessonData.t_id, type: _LESSON_, id: sen_id}});
            }
        }
    }
</script>
<style>
    .separate{
        position: absolute;
        top: 0;
        right: -2px;
        line-height: 50px;
        font-size: 30px;
        color: #efecec;
    }
    .tab-header .tab-item{
        border-bottom: 2px solid #efecec;
        color: black;
        cursor: pointer;
        padding-bottom: 8px;
        margin-left: 0px;
        margin-right: 0px;
    }
    .tab-header .tab-item.active{
        border-bottom: 2px solid #0093ec;
        color: #0093ec;
    }
</style>