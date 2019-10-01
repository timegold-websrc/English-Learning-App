<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/extracourse" class="link-primary ml-1">课外阅读</router-link> > 
            <span>{{bookName}}</span> 
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div class="card fn-14">
                    <div class="row text-center m-0 pt-3 pb-3">
                        <div class="col-4 p-0 m-0">
                            <p>作者</p>
                            <p class="mb-0 fn-12"><img src="img/icons/user_mute.png" alt="record" class="icon-12 mr-2">{{outlessonData ? outlessonData.author : ''}}</p>
                            <div class="separate">|</div>
                        </div>
                        <div class="col-4 p-0 m-0">
                            <p>总得分</p>
                            <p v-if="!outlessonData" class="mb-0 fn-danger">0分</p>
                            <p v-else-if="outlessonData.progress > 80" class="mb-0 fn-success">{{outlessonData.progress}}分</p>
                            <p v-else-if="outlessonData.progress > 60" class="mb-0 fn-warning">{{outlessonData.progress}}分</p>
                            <p v-else class="mb-0 fn-danger">{{outlessonData.progress}}分</p>
                            <div class="separate">|</div>
                        </div>
                        <div class="col-4 p-0 m-0">
                            <p>总条数</p>
                            <p  class="mb-0 fn-12">{{outlessonData ? outlessonData.count : 0}}条</p>
                        </div>
                    </div>
                </div>
                <div v-if="tmpData" class="card pt-3 pb-3">
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

                                <span class="ml-2"><img src="img/icons/record.png" alt="record" class="icon-small"> </span>
                                <span class="ml-2">
                                    <img :src="item.like ? 'img/icons/love_active.png' : 'img/icons/love.png'" 
                                        alt="record"
                                        class="icon-small"
                                        @click="setLike(index)">
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
    const _OUT_LESSON_ = 2;
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
                outlessonId: null,
                bookName: null,
                outlessonData: null,
                readSen: [],
                unReadSen: [],
                tmpData: [],

                userRole: null,
            }
        },
        mounted() {
            this.outlessonId = this.$route.query.id;
            this.bookName = this.$route.query.name;
            this.userRole = this.$store.getters.getRole;

            this.selectTab(0);
            this.initSentences();
        },
        methods: {
            initSentences(){
                var _this = this;
                var token = this.$store.getters.getToken;
                
                var path = this.$serverURL;
                if(this.userRole == 'student') path += '/api/students/out_lesson/' + this.outlessonId;
                else path += '/api/guests/out_lesson/' + this.outlessonId;

                axios.get(path, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        console.log(resData);
                        var outlesson = resData[0];
                        _this.outlessonData = {
                            book_name: outlesson.book.name,
                            author: outlesson.book.author,
                            progress: 0,
                            count: 0
                        }

                        var sentences = outlesson.out_sentences;
                        _this.readSen = [];
                        _this.unReadSen = [];
                        var sum_mark = 0;
                        for(var index in sentences){
                            var sentence = sentences[index];
                            if(sentence.out_results.length) {
                                if(sentence.out_results[0].marks) {
                                    sentence.status = true;
                                    sum_mark += sentence.out_results[0].marks;
                                    _this.readSen.push(sentence);
                                }else{ 
                                    sentence.status = false;
                                    _this.unReadSen.push(sentence);
                                }
                                sentence.like = sentence.out_results[0].heart;  
                                sentence['student_results'] = sentence.out_results;
                            }else{
                                sentence['student_results'] = [];
                                sentence.status = 0;
                                sentence.like = false;
                                _this.unReadSen.push(sentence);
                            } 
                        }

                        _this.outlessonData.count = sentences.length;
                        _this.outlessonData.progress = sentences.length ? Math.round(sum_mark/sentences.length) : 0;
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
                this.recordStatus = 'start';
            },
            filterData(){
                if(!this.outlessonData) return;
                
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

                var path = this.$serverURL;
                if(this.userRole == 'student') path += '/api/students/setLikeInOutLesson/' + sentence_id;
                else path += '/api/guests/setLikeInOutLesson/' + sentence_id;

                axios.put(path, {isHeart: isLike}, {headers: {'authorization': `${token}`}})
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

                var path = this.$serverURL;
                if(this.userRole == 'student') path += '/api/students/updateResultInOutLesson/' + sentence_id;
                else path += '/api/guests/updateResultInOutLesson/' + sentence_id;

                axios.put(path, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.initSentences();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['课外说读', this.bookName] , type: _OUT_LESSON_, id: sen_id}});
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