import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
enum Api {
  list = '/sys/user/list',
  save = '/sys/user/add',
  edit = '/sys/user/edit',
  agentSave = '/sys/sysUserAgent/add',
  agentEdit = '/sys/sysUserAgent/edit',
  getUserRole = '/sys/user/queryUserRole',
  duplicateCheck = '/sys/duplicate/check',
  deleteUser = '/sys/user/delete',
  deleteBatch = '/sys/user/deleteBatch',
  importExcel = '/sys/user/importExcel',
  exportXls = '/sys/user/exportXls',
  recycleBinList = '/sys/user/recycleBin',
  putRecycleBin = '/sys/user/putRecycleBin',
  deleteRecycleBin = '/sys/user/deleteRecycleBin',
  allRolesList = '/sys/role/queryall',
  allTenantList = '/sys/tenant/queryList',
  allPostList = '/sys/position/list',
  userDepartList = '/sys/user/userDepartList',
  changePassword = '/sys/user/changePassword',
  frozenBatch = '/sys/user/frozenBatch',
  getUserAgent = '/sys/sysUserAgent/queryByUserName',
  syncUser = '/act/process/extActProcess/doSyncUser',
}
/**
 * Export API
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * Import API
 */
export const getImportUrl = Api.importExcel;
/**
 * List interface
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * User interface
 * @param params
 */
export const getUserRoles = (params) => defHttp.get({ url: Api.getUserRole, params }, { errorMessageMode: 'none' });

/**
 * delete users
 */
export const deleteUser = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteUser, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * Batch delete users
 * @param params
 */
export const batchDeleteUser = (params, handleSuccess) => {
  Modal.confirm({
    title: t('system.user.confirmDelete'),
    content: t('system.user.warning.deleteWarning'),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * Save or update the user
 * @param params
 */
export const saveOrUpdateUser = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * Unique school inspection
 * @param params
 */
export const duplicateCheck = (params) => defHttp.get({ url: Api.duplicateCheck, params }, { isTransformResponse: false });
/**
 * Get all the roles
 * @param params
 */
export const getAllRolesList = (params) => defHttp.get({ url: Api.allRolesList, params });
/**
 * Get all the tenants
 */
export const getAllTenantList = (params) => defHttp.get({ url: Api.allTenantList, params });
/**
 * Get the designated user responsible department
 */
export const getUserDepartList = (params) => defHttp.get({ url: Api.userDepartList, params }, { successMessageMode: 'none' });
/**
 * Get all your position
 */
export const getAllPostList = (params) => {
  return new Promise((resolve) => {
    defHttp.get({ url: Api.allPostList, params }).then((res) => {
      resolve(res.records);
    });
  });
};
/**
 * Recycling station list
 * @param params
 */
export const getRecycleBinList = (params) => defHttp.get({ url: Api.recycleBinList, params });
/**
 * Recycling station restoration
 * @param params
 */
export const putRecycleBin = (params, handleSuccess) => {
  return defHttp.put({ url: Api.putRecycleBin, params }).then(() => {
    handleSuccess();
  });
};
/**
 * Recycling station delete
 * @param params
 */
export const deleteRecycleBin = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteRecycleBin, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * change Password
 * @param params
 */
export const changePassword = (params) => {
  return defHttp.put({ url: Api.changePassword, params });
};
/**
 * Frozen
 * @param params
 */
export const frozenBatch = (params, handleSuccess) => {
  return defHttp.put({ url: Api.frozenBatch, params }).then(() => {
    handleSuccess();
  });
};
/**
 * Get user agent
 * @param params
 */
export const getUserAgent = (params) => defHttp.get({ url: Api.getUserAgent, params }, { isTransformResponse: false });
/**
 * Save or update the user agent
 * @param params
 */
export const saveOrUpdateAgent = (params) => {
  let url = params.id ? Api.agentEdit : Api.agentSave;
  return defHttp.post({ url: url, params });
};

/**
 * User synchronization process
 * @param params
 */
export const syncUser = () => defHttp.put({ url: Api.syncUser });
