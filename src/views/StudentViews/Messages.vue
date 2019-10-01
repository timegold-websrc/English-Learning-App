<template>
    <ContentWrapper>
        <div class="card m-2">
            <div class="card-body p-4">
                <div class="card-title pb-3 pl-3 fn-24" style="font-weight: 500">全部消息</div>

                <div v-for="(item, index) in messages" v-bind:key="index" class="row news-item pt-2 pb-2 mr-0 ml-0 cursor-pointer" @click="updateMessage(index)">
                    <div class="col-8 text-center" :class="item.status ? 'text-muted' : ''">
                        <div class="d-flex align-items-center">
                            <avatar username="" :size="64" :src="item.teacher.avatar_url" class="mr-2"/>
                            <div class="text-left">
                                <p class="mb-1 mt-1 fn-20">{{item.teacher.name}}</p>
                                <p class="fn-16">{{item.msg}}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-4" :class="item.status ? 'text-muted' : ''">
                        <div class="text-right">
                            <p class="mb-2 mt-1 fn-16">{{item.createdAt}}</p>
                            <p v-if="item.status" class="mb-4 mt-2 fn-16">已读</p>
                            <p v-else class="fn-16  fn-danger">未读</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                userRole: null,
                messages: [],
                isShow: null,

                searchVal: ''
            }
        },
        watch: {
            $route: function(val){
                this.initMessages();
            }
        },
        mounted() {
            this.userRole = this.$store.getters.getRole;
    
            $('#search-value').on('keyup', function(e){
                this.searchVal = $('#search-value').val();
                console.log(this.searchVal)
            })
            this.initMessages();
        },
        methods: {
            initMessages(){
                if(this.userRole != 'student') return;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/getMessages', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        var unread_count = 0;
                        for(var index in resData){
                            var _data = resData[index];
                            if(_data.teacher.avatar_url) _data.teacher.avatar_url = _this.$serverURL + _data.teacher.avatar_url;
                            else _data.teacher.avatar_url = 'img/user/dummy_user.png';
                            _data.createdAt = _data.createdAt.replace(/-/g, '/').substr(0, 10);
                            _data.status = !!_data.message_results.length;
                            if(!_data.status) unread_count += 1;
                        }
                        _this.messages = resData;
                        _this.$router.push({path: '/messages', query: {news: unread_count}});
                        console.log(_this.messages);
                    })
            },
            updateMessage(index){
                if(this.userRole != 'student') return;
                if(this.messages[index].status) return;
                var m_id = this.messages[index].id;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/students/changeMessageStatus/' + m_id, {},{headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        _this.initMessages();
                    })
            },
            
        }
    }
</script>
<style>
    .news-item{
        color: black;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-bottom: 2px solid #ecebeb;
        /* background-color: #ecebeb; */
    }
    .news-item:hover{
        background-color: #f3f3f3;
    }
</style>