import { dbDao } from './DbDao'
import logger from '../../logger/logger'

export class ConfigDB {
  async getConfig() {
    const data = await dbDao('config').select('*').first()
    if (!data) {
      return {
        cachePath: null,
        chromePath: null
      }
    }
    return data
  }

  async create(tagData) {
    const [id] = await dbDao('config').insert(tagData)
    return { ...tagData, id }
  };


  async update(id, updatedData) {
    try {
      await dbDao('config')
        .where({ id })
        .update(updatedData)
      return true
    } catch (error) {
      logger.error(`更新Config失败 id=${id},data=${updatedData},err=${error.message}`)
      throw new Error('更新失败' + error.message)
    }
  };
}



