export enum HttpCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const HttpCodeMessage: Record<HttpCode, string> = {
  [HttpCode.OK]: '操作成功',
  [HttpCode.CREATED]: '创建成功',
  [HttpCode.BAD_REQUEST]: '请求参数错误',
  [HttpCode.UNAUTHORIZED]: '请先登录',
  [HttpCode.FORBIDDEN]: '无权操作',
  [HttpCode.NOT_FOUND]: '请求的资源不存在',
  [HttpCode.INTERNAL_SERVER_ERROR]: '服务器错误，请稍后重试',
};
