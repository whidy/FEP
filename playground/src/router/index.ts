import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/form',
    },
    {
      path: '/form',
      component: () => import('../views/form/index.vue'),
      children: [
        {
          path: '/form/edit',
          component: () => import('../views/form/edit.vue'),
        },
      ],
    },
    {
      path: '/menu-config',
      component: () => import('../views/menu-config/index.vue'),
    },
    {
      path: '/dict-config',
      component: () => import('../views/dict-config/index.vue'),
    },
    {
      path: '/preview',
      component: () => import('../views/preview/index.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  const base = to.query.base
  if (base && base.startsWith('formilyJson')) { // 简单的校验。
    localStorage.setItem('base', to.query.base)
    next()
    return
  }
  const existBase = localStorage.getItem('base')
  if (existBase) {
    next({
      path: to.path,
      query: { base: existBase, ...to.query }
    })
  } else {
    // 前辈设计的方案，需要管理员分配地址后才能使用。
    alert('缺少base参数，请先向管理员获取访问路径')
    // next();
  }
})

export default router
