<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/collection/review" class="link-primary ml-1">错词本</router-link> >  
            <span class="ml-1">{{levelName}}</span>
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div class="card pt-3 pb-3">
                    <div class="fn-18 border_b_2_muted pb-1 pl-3">{{levelName}}</div>
                    <div style="max-height: 630px; overflow: auto">
                        <div v-for="(item, index) in levelData" 
                            :key="index"
                            :class="sentenceIndex == index ? 'active' : ''"
                            @click="selectSentence(index)"
                            class="d-flex align-items-center p-2 sentence">
                            <div class="mr-auto">{{item.text}}</div>
                            <div class="flex-shrink-0 fn-14"  style="min-width: 62px">
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
            <div class="card col-8 p-4" style="height: fit-content">
                <play-board 
                    :sentenceData="levelData[sentenceIndex]" 
                    :hasLike = "true"
                    @changeResult="updateSentenceResult"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _WRONG_COLLECTION_   = 5;
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
                levelData: []
            }
        },
        computed: {
        },
        mounted() {
            this.level = this.$route.query.level;
            this.levelName = this.$route.query.name;
            
            this.updateLevel();
        },
        methods: {
            updateLevel: function(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/collections/wrong_collection_details/' + (this.level - 1), {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var sentences = response.data;
                        // console.log(sentences);

                        for(var index in sentences){
                            var sentence = sentences[index];
                            sentence['student_results'] = sentence.wrong_collection_results;

                            if(sentence.student_results.length) {
                                sentence['marks'] = sentence.student_results[0].marks ? sentence.student_results[0].marks : 0;
                            }else {
                                sentence['marks'] = 0;
                            }
                        }

                        _this.levelData = sentences;
                    })
            },
            selectSentence(index){
                this.sentenceIndex = index;
            },
            updateSentenceResult(data){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.levelData[this.sentenceIndex].id;
                axios.put(this.$serverURL + '/api/collections/updateWrongCollectionResult/' + sentence_id, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.updateLevel();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['错词本', this.levelName] , type: _WRONG_COLLECTION_, id: sen_id}});
            }
        }
    }
</script>
<style>
    .range{
        border-bottom: 2px solid #efecec;
        padding-left: 18px;
    }
</style>

