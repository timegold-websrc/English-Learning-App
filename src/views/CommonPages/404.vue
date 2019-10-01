<template>
    <div class="abs-center wd-xl">
        <!-- START card-->
        <div class="text-center mb-4">
            <div class="text-lg mb-3">404</div>
            <p class="lead m-0">We couldn't find this page.</p>
            <p>The page you are looking for does not exists.</p>
        </div>
        <ul class="list-inline text-center text-sm mb-4 fn-14">
            <li class="list-inline-item">
                <span class="text-muted link-primary cursor-pointer" @click="$router.go(-1)">Go to App</span>
            </li>
            <li class="text-muted list-inline-item">|</li>
            <li class="list-inline-item">
                <router-link class="text-muted link-primary" :to="$store.getters.getRole ? '/' + $store.getters.getRole + '/login' : '/login'">Login</router-link>
            </li>
            <li class="text-muted list-inline-item">|</li>
            <li class="list-inline-item">
                <router-link class="text-muted link-primary" :to="$store.getters.getRole ? '/' + $store.getters.getRole + '/register': '/register'">Register</router-link>
            </li>
        </ul>
        <div class="p-3 text-center">
            <span class="mr-2">&copy;</span>
            <span>2019</span>
            <span class="mr-2">-</span>
            <span>English learning</span>
        </div>
    </div>
</template>
