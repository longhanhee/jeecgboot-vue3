import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const { createConfirm } = useMessage();

enum Api {
  treeList = '/sys/sysDepart/queryMyDeptTreeList',
  queryIdTree = '/sys/sysDepart/queryIdTree',
  searchBy = '/sys/sysDepart/searchBy',
}

// Department user API
enum DepartUserApi {
  list = '/sys/user/departUserList',
  link = '/sys/user/editSysDepartWithUser',
  unlink = '/sys/user/deleteUserInDepartBatch',
}

// Department role API
enum DepartRoleApi {
  list = '/sys/sysDepartRole/list',
  deleteBatch = '/sys/sysDepartRole/deleteBatch',
  save = '/sys/sysDepartRole/add',
  edit = '/sys/sysDepartRole/edit',
  queryTreeListForDeptRole = '/sys/sysDepartPermission/queryTreeListForDeptRole',
  queryDeptRolePermission = '/sys/sysDepartPermission/queryDeptRolePermission',
  saveDeptRolePermission = '/sys/sysDepartPermission/saveDeptRolePermission',
  dataRule = '/sys/sysDepartRole/datarule',
  getDeptRoleList = '/sys/sysDepartRole/getDeptRoleList',
  getDeptRoleByUserId = '/sys/sysDepartRole/getDeptRoleByUserId',
  saveDeptRoleUser = '/sys/sysDepartRole/deptRoleUserAdd',
}

/**
 * List of Tree Tree
 */
export const queryMyDepartTreeList = (params?) => defHttp.get({ url: Api.treeList, params }, { isTransformResponse: false });

/**
 * Query data, load the name of all departments in the form of tree structure
 */
export const queryIdTree = (params?) => defHttp.get({ url: Api.queryIdTree, params });

/**
 * Search department according to keywords
 */
export const searchByKeywords = (params) => defHttp.get({ url: Api.searchBy, params });

/**
 * Query user information under the department
 */
export const departUserList = (params) => defHttp.get({ url: DepartUserApi.list, params });

/**
 * Related relationships between departments and users in batches
 *
 * @param departId Department ID
 * @param userIdList User ID list
 */
export const linkDepartUserBatch = (departId: string, userIdList: string[]) => defHttp.post({ url: DepartUserApi.link, params: { depId: departId, userIdList } });

/**
 * Cancellation of the relationship between departments and users
 */
export const unlinkDepartUserBatch = (params, confirm = false) => {
  return new Promise((resolve, reject) => {
    const doDelete = () => {
      resolve(defHttp.delete({ url: DepartUserApi.unlink, params }, { joinParamsToUrl: true }));
    };
    if (confirm) {
      createConfirm({
        iconType: 'warning',
        title: t('common.unlink'),
        content: t('system.depart.warning.unlinkWarning'),
        onOk: () => doDelete(),
        onCancel: () => reject(),
      });
    } else {
      doDelete();
    }
  });
};

/**
 * Query department role information
 */
export const departRoleList = (params) => defHttp.get({ url: DepartRoleApi.list, params });

/**
 * Save or update the role of the department
 */
export const saveOrUpdateDepartRole = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.put({ url: DepartRoleApi.edit, params });
  } else {
    return defHttp.post({ url: DepartRoleApi.save, params });
  }
};

/**
 * Batch delete department role
 */
export const deleteBatchDepartRole = (params, confirm = false) => {
  return new Promise((resolve, reject) => {
    const doDelete = () => {
      resolve(defHttp.delete({ url: DepartRoleApi.deleteBatch, params }, { joinParamsToUrl: true }));
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
 * User role authorization function, query menu permission tree
 */
export const queryTreeListForDeptRole = (params) => defHttp.get({ url: DepartRoleApi.queryTreeListForDeptRole, params });
/**
 * Query role authorization
 */
export const queryDeptRolePermission = (params) => defHttp.get({ url: DepartRoleApi.queryDeptRolePermission, params });
/**
 * Save role authorization
 */
export const saveDeptRolePermission = (params) => defHttp.post({ url: DepartRoleApi.saveDeptRolePermission, params });

/**
 *  Query department role data permissions list
 */
export const queryDepartRoleDataRule = (functionId, departId, roleId, params?) => {
  let url = `${DepartRoleApi.dataRule}/${unref(functionId)}/${unref(departId)}/${unref(roleId)}`;
  return defHttp.get({ url, params });
};
/**
 * Preserving department role data permissions
 */
export const saveDepartRoleDataRule = (params) => defHttp.post({ url: DepartRoleApi.dataRule, params });
/**
 * Query departmental user authorization
 */
export const queryDepartRoleUserList = (params) => defHttp.get({ url: DepartRoleApi.getDeptRoleList, params });
/**
 * Observed according to the userd query department's role user authorization
 */
export const queryDepartRoleByUserId = (params) => defHttp.get({ url: DepartRoleApi.getDeptRoleByUserId, params });
/**
 * Save the department's role user authorization
 */
export const saveDepartRoleUser = (params) => defHttp.post({ url: DepartRoleApi.saveDeptRoleUser, params });
