import { dbDao } from './DbDao'
import logger from '../../logger/logger'

//查询
export class GroupDB {
  async all(query, params) {
    // 初始化查询构建器，选择要查询的表
    let eq = dbDao('group')
    if (params) {
      if (params.orderBy && params.orderBy !== '') {
        if (params.desc != null && params.desc !== '') {
          eq = eq.orderBy(params.orderBy, params.desc.toLowerCase())
        } else {
          eq = eq.orderBy(params.orderBy, 'desc')
        }
      }


      if (params.pageNum && params.pageNum > 1) {
        eq = eq.offset((params.pageNum - 1) * params.pageSize)
      }
      if (params.pageSize && params.pageSize > 0) {
        eq = eq.limit(params.pageSize)
      } else {
        eq = eq.limit(10)
      }

    } else {
      eq = eq.orderBy('id', 'desc')
    }

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        //排除空值
        if (key && value && value !== '') {
          eq = eq.where(key, value)
        }
      }
    }

    return eq.select('*')

  }

  async getTotal(query) {
    let eq = dbDao('group')
    if (Object.keys(query).length > 0) {
      for (const [key, value] of Object.entries(query)) {
        //排除空值
        if (value && value !== '') {
          eq = eq.where(key, value)
        }
      }
    }
    const result = await eq.count('id as count').first()
    return result.count
  }

  async getById(id) {
    return dbDao('group').where({ id }).select('*').first()
  }


  async create(tagData) {
    const count = await dbDao('group').count('id').where({ name: tagData.name })
    if (count > 0) {
      logger.error(`创建group失败，group名称已存在 data=${tagData}`)
      throw new Error('创建group失败，group名称已存在')
    }
    const [id] = await dbDao('group').insert(tagData)
    return { ...tagData, id }
  };

  async update(id, updatedData) {
    try {
      await dbDao('group')
        .where({ id })
        .update(updatedData)
      return true
    } catch (error) {
      throw new Error('更新失败' + error.message)
    }
  };

  async remove(id) {
    try {
      await dbDao('window').where("groupId",id).update({groupId:null})
      await dbDao('group').delete().where({ id })
      return true
    } catch (error) {
      throw new Error('删除失败' + error.message)
    }
  };
}




