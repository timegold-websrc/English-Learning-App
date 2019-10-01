<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/collection/review" class="link-primary ml-1">错词本</router-link> >  
            <span class="ml-1">{{levelName}}</span> 
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div class="card  p-2">
                    <div class="d-flex align-items-center">
                        <div class="mr-auto" >
                            <div class="d-flex">
                                <avatar username="" :size="56" :src="teacherInfo.avatar" class="mr-2"/>
                                <div class="text-left">
                                    <p class="mb-0 mt-1 fn-18">{{teacherInfo.name}}
                                        <img v-if="levelStatus == 2" src="img/icons/finger.png" alt="image" class="icon-26 ml-1">
                                    </p>

                                    <p v-if="levelStatus == 1" class="mb-0 fn-warning fn-12">距离做完还差一题哦!</p>
                                    <p v-else-if="levelStatus == 2" class="mb-0 fn-success fn-12">恭喜过关!</p>
                                    <p v-else-if="levelStatus == 3" class="mb-0 fn-danger fn-12">很遗憾，本次闯关失败!</p>
                                    <p v-else class="mb-0 fn-info fn-12">赶紧开始闯关吧!</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="levelStatus == 1" class="border-circle border-warning fn-11 ml-2 fn-warning">未做完</div>
                        <div v-else-if="levelStatus == 2" class="d-flex">
                            <img src="img/icons/great.png" alt="record" class="icon-standard">
                            <div class="border-circle border-success fn-11 ml-2 fn-success">{{avg_marks}}分</div>
                        </div>
                        <div v-else-if="levelStatus == 3" class="border-circle border-danger fn-11 ml-2 fn-danger">重来</div>
                        <div v-else class="border-circle border-primary fn-11 ml-2 fn-info">加油</div>
                    </div>
                </div>
                <div v-if="lessonData" class="card pt-3 pb-3">
                    <div class="fn-18 border_b_2_muted pb-1 pl-3">{{levelName}}</div>
                    <div style="max-height: 538px; overflow:auto">
                        <div v-for="(item, index) in lessonData" 
                            :key="index"
                            :class="sentenceIndex == index ? 'active' : ''"
                            @click="selectSentence(index)"
                            class="d-flex align-items-center p-2 sentence">
                            <div class="mr-auto">{{item.text}}</div>
                            <div class="flex-shrink-0 fn-14 "  style="min-width: 62px">
                                <span class="mr-2"><img src="img/icons/record.png" alt="record" class="icon-small"> </span>

                                <span v-if="!item.marks"  class="fn-info">待做</span>
                                <span v-else-if="item.marks >= 80" class="fn-success">{{item.marks}}分</span>
                                <span v-else-if="item.marks >= 60" class="fn-warning">{{item.marks}}分</span>
                                <span v-else  class="fn-danger">{{item.marks}}分</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card col-8 p-4">
                <play-board 
                    :sentenceData="lessonData[sentenceIndex]" 
                    :hasLike = "true"
                    @changeResult="updateSentenceResult"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _GAME_        = 4;
    
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    import PlayBoard from '@/components/Common/PlayBoard';
    export default {
        components: {
            Avatar,
            PlayBoard
        },
        data () {
            return {
                teacherInfo: {name: '老师', avatar: 'img/user/dummy_user.png'},
                level: '',
                levelName: '',
                levelStatus: 0,
                avg_marks: 0,
                sentenceIndex: 0,
                lessonData: []
            }
        },
        computed: {
        },
        mounted() {
            this.level = this.$route.query.level;
            this.levelName = this.$route.query.name;
            
            this.updateLesson();
        },
        methods: {
            updateLesson: function(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/collections/game_details/' + this.level, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var sentences = response.data;
                        var unRead_count = 0;
                        var t_marks = 0;
                        // console.log(sentences);

                        for(var index in sentences){
                            var sentence = sentences[index];
                            sentence['student_results'] = sentence.game_results;

                            if(sentence.student_results.length) {
                                sentence['marks'] = sentence.student_results[0].marks ? sentence.student_results[0].marks : 0;
                                t_marks += sentence.marks;
                            }else {
                                sentence['marks'] = 0;
                                unRead_count += 1;
                            }
                        }

                        _this.avg_marks = Math.round(t_marks / sentences.length);
                        if(t_marks){
                            if(unRead_count) _this.levelStatus = 1;
                            else if(_this.avg_marks > 80) _this.levelStatus = 2;
                            else _this.levelStatus = 3
                        } 
                        _this.lessonData = sentences;
                    })
            },
            selectSentence(index){
                this.sentenceIndex = index;
            },
            updateSentenceResult(data){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.lessonData[this.sentenceIndex].id;
                axios.put(this.$serverURL + '/api/collections/updateGameResult/' + sentence_id, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.updateLesson();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['错词本', this.levelName] , type: _GAME_, id: sen_id}});
            }
        }
    }
</script>
