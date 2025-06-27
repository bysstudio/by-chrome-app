//express服务器
import express from "express";

const router = express.Router();





// 设置路由（根据需要添加）
router.get('/index', (req, res) => {
    res.send({ success: false, message: '我是ProxyPingController' });
});

router.post('/create', (req, res) => {
    if(!req.body){
        res.send({ success: false, message: 'create 失败' });
        return;
    }

})






export default router
