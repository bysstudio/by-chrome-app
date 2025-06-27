//express服务器
import { ConfigDB } from './db/ConfigDB'

import express from 'express'

import { resOk, resFail } from './utlis/resutil'


const router = express.Router()
const db = new ConfigDB()
// 设置路由（根据需要添加）
router.get('/info', async (req, res) => {
  try {
    const data = await db.getConfig()
    res.send(resOk({ data: data }))
  } catch (err) {
    res.send(resFail(err.message))
  }

})

router.post('/update', async (req, res) => {
  if (!req.body) {
    res.send(resFail('请求Body不能为空'))
    return
  }
  const { id, data } = req.body
  if (id) {
    try {
      await db.update(id, data)
      res.send(resOk({ data: data }))
    } catch (err) {
      res.send(resFail(err.message))
    }
  } else {
    try {
      const result = await db.create(data)
      res.send(resOk({ data: result }))
    } catch (err) {
      res.send(resFail(err.message))
    }
  }
})


export default router
