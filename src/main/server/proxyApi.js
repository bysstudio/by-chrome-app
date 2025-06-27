//express服务器
import express from 'express'

import { parseQuery, resFail, resOk } from './utlis/resutil'


import { ProxyDB } from './db/ProxyDB'

import { ProxyService } from './service/ProxyService'


const router = express.Router()
const db = new ProxyDB()
const proxyService = new ProxyService()
/**
 * 查询列表 支持分页与筛选操作
 */
router.get('/list', async (req, res) => {
  const data = parseQuery(req.query)
  try {
    const windowData = await db.all(data.query, data.params)

    let total = await db.getTotal(data.query)
    res.send(resOk({ data: windowData, total: total }))
  } catch (err) {
    console.error(err)
    res.send(resFail(err.message))
  }
})

/**
 * 根据ID获取代理信息
 */
router.get('/info', async (req, res) => {
  const { id } = req.query
  if (id) {
    try {
      const windowData = await db.getBaseById(id)
      res.send(resOk({ data: windowData }))
    } catch (error) {
      console.error(error)
      res.send(resFail(error.message))
    }
  } else {
    res.send(resFail('代理ID不能为空'))
  }
})


/**
 * 批量导入代理
 */
router.post('/import', async (req, res) => {
  if (!req.body) {
    res.send(resFail('请求Body不能为空'))
    return
  }
  try {
    await db.importProxies(req.body)
    res.send(resOk({ msg: '导入代理成功' }))
  } catch (err) {
    res.send(resFail(err.message))
  }

})

/**
 * 创建代理
 */
router.post('/create', async (req, res) => {
  if (!req.body) {
    res.send(resFail('请求Body不能为空'))
    return
  }
  try {
    const data = await db.create(req.body)
    res.send(resOk({ data: data, msg: '创建代理成功' }))
  } catch (err) {
    res.send(resFail(err.message))
  }

})

/**
 * 删除
 */
router.delete('/delete', async (req, res) => {
  const { ids } = req.body
  console.log('批量删除', ids)
  if (ids) {
    try {
      await db.batchRemove(JSON.parse(ids))
      res.send(resOk({ msg: `删除代理ID${ids}成功` }))
    } catch (error) {
      console.error(error)
      res.send(resFail(error.message))
    }
  } else {
    res.send(resFail('代理ID不能为空'))
  }
})

/**
 * 更新数据
 */
router.put('/update', async (req, res) => {
  const { id, data } = req.body
  console.log('id', id, 'data', data)
  if (!id || !data) {
    res.send(resFail('更新数据不能为空'))
    return
  }
  try {
    await db.update(id, data)
    res.send(resOk({ msg: `修改代理ID${id}数据成功` }))
  } catch (err) {
    res.send(resFail(err.message))
  }
})


router.post('/testProxy', async (req, res) => {
  const data = req.body

  console.log('body', data)
  if (!data) {
    res.send(resFail('Body数据不能为空'))
    return
  }
  try {
    const result = await proxyService.testProxy(data)
    res.send(resOk({ data: result }))
  } catch (err) {
    res.send(resFail(err.message))
  }
})


router.get('/testProxyById', async (req, res) => {
  const { id } = req.query

  if (!id) {
    res.send(resFail('id数据不能为空'))
    return
  }
  try {
    let item = await db.getBaseById(id)
    if (!item) {
      res.send(resFail('代理id不存在'))
    }

    //不等待
    proxyService.testProxy(item, true)
    res.send(resOk({ data: '' }))
  } catch (err) {
    res.send(resFail(err.message))
  }

  //   console.log("打印",item)
  //   const result = await proxyService.testProxy(item, true);
  //
  //
  //   item.checkData = result.pings;
  //   item.checkStatus = result.checkStatus;
  //   item = { ...item, ...result.ipInfo };
  //   res.send(resOk({ data: item }));
  // } catch (err) {
  //   res.send(resFail(err.message));
  // }
})

router.get('/batchTestProxy', async (req, res) => {
  const { ids } = req.query

  if (!ids || ids.length === 0) {
    res.send(resFail('ids数据不能为空'))
    return
  }
  try {
    proxyService.testBatchProxy(ids)
    res.send(resOk({ data: '' }))
  } catch (err) {
    res.send(resFail(err.message))
  }

})

export default router
