import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const { createConfirm } = useMessage();

export enum Api {
  queryDepartTreeSync = '/sys/sysDepart/queryDepartTreeSync',
  save = '/sys/sysDepart/add',
  edit = '/sys/sysDepart/edit',
  delete = '/sys/sysDepart/delete',
  deleteBatch = '/sys/sysDepart/deleteBatch',
  exportXlsUrl = '/sys/sysDepart/exportXls',
  importExcelUrl = '/sys/sysDepart/importExcel',

  roleQueryTreeList = '/sys/role/queryTreeList',
  queryDepartPermission = '/sys/permission/queryDepartPermission',
  saveDepartPermission = '/sys/permission/saveDepartPermission',

  dataRule = '/sys/sysDepartPermission/datarule',

  getCurrentUserDeparts = '/sys/user/getCurrentUserDeparts',
  selectDepart = '/sys/selectDepart',
}

/**
 * List of Tree Tree
 */
export const queryDepartTreeSync = (params?) => defHttp.get({ url: Api.queryDepartTreeSync, params });

/**
 * Save or update the role of the department
 */
export const saveOrUpdateDepart = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  } else {
    return defHttp.post({ url: Api.save, params });
  }
};

/**
 * Batch delete department role
 */
export const deleteBatchDepart = (params, confirm = false) => {
  return new Promise((resolve, reject) => {
    const doDelete = () => {
      resolve(defHttp.delete({ url: Api.deleteBatch, params }, { joinParamsToUrl: true }));
    };
    if (confirm) {
      createConfirm({
        iconType: 'warning',
        title: t('common.delete'),
        content: t('common.message.deleteWarning'),
        onOk: () => doDelete(),
        onCancel: () => reject(),
      });
    } else {
      doDelete();
    }
  });
};

/**
 * List of obtaining permissions trees
 */
export const queryRoleTreeList = (params?) => defHttp.get({ url: Api.roleQueryTreeList, params });
/**
 * Query department authority
 */
export const queryDepartPermission = (params?) => defHttp.get({ url: Api.queryDepartPermission, params });
/**
 * Save departments authority
 */
export const saveDepartPermission = (params) => defHttp.post({ url: Api.saveDepartPermission, params });

/**
 *  Query department data permissions list
 */
export const queryDepartDataRule = (functionId, departId, params?) => {
  let url = `${Api.dataRule}/${unref(functionId)}/${unref(departId)}`;
  return defHttp.get({ url, params });
};
/**
 * Preserving department data permissions
 */
export const saveDepartDataRule = (params) => defHttp.post({ url: Api.dataRule, params });
/**
 * Get information on login user sector
 */
export const getUserDeparts = (params?) => defHttp.get({ url: Api.getCurrentUserDeparts, params });
/**
 * Switch selection department
 */
export const selectDepart = (params?) => defHttp.put({ url: Api.selectDepart, params });
