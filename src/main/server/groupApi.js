//express服务器
import express from "express";

import { parseQuery, resFail, resOk } from "./utlis/resutil";


import { GroupDB } from "./db/GroupDB";

const router = express.Router();

const db=new GroupDB();
/**
 * 查询列表 支持分页与筛选操作
 */
router.get('/list', async (req, res) => {
    const data = parseQuery(req.query);
    try {
        const windowData = await db.all(data.query, data.params);
      let total = await db.getTotal(data.query);
      res.send(resOk({ data: windowData,total:total }));
    } catch (err) {
        console.error(err);
        res.send(resFail(err.message));
    }
});
/**
 * 创建
 */
router.post('/create', async (req, res) => {
    if (!req.body) {
        res.send(resFail('请求Body不能为空'));
        return;
    }
    try {
        const  data=await  db.create(req.body);
        res.send(resOk({data: data, msg: '创建分组成功'}));
    }catch (err){
        res.send(resFail(err.message));
    }

})

/**
 * 删除
 */
router.delete('/delete', async (req, res) => {
    const {id} = req.body;
    if (id) {
        try {
            await db.remove(id);
            res.send(resOk({msg: `删除分组ID${id}成功`}));
        } catch (error) {
            console.error(error);
            res.send(resFail(error.message));
        }
    } else {
        res.send(resFail('分组ID不能为空'));
    }
});

/**
 * 更新数据
 */
router.put('/update', async (req, res) => {
    const {id, data} = req.body;
    if (!id || !data) {
        res.send(resFail('更新数据不能为空'));
        return;
    }
    try {
        await db.update(id, data);
        res.send(resOk({msg: `修改分组ID${id}数据成功`}));
    } catch (err) {
        res.send(resFail(err.message));
    }
});

export default router
