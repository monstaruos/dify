import {
  memo,
  useCallback,
  useState,
} from 'react'
import cn from 'classnames'
import { capitalize } from 'lodash-es'
import {
  useStoreApi,
} from 'reactflow'
import { RiAddLine, RiCloseLine, RiDeleteBinLine, RiEditLine, RiLock2Line } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/app/components/workflow/store'
import Button from '@/app/components/base/button'
import { Env } from '@/app/components/base/icons/src/vender/line/others'
import VariableModal from '@/app/components/workflow/panel/env-panel/variable-modal'
import type {
  EnvironmentVariable,
} from '@/app/components/workflow/types'
import { findUsedVarNodes, updateNodeVars } from '@/app/components/workflow/nodes/_base/components/variable/utils'
import RemoveEffectVarConfirm from '@/app/components/workflow/nodes/_base/components/remove-effect-var-confirm'

const EnvPanel = () => {
  const { t } = useTranslation()
  const store = useStoreApi()
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const envList = useStore(s => s.environmentVariables) as EnvironmentVariable[]
  const updateEnvList = useStore(s => s.setEnvironmentVariables)

  const [showVariableModal, setShowVariableModal] = useState(false)
  const [currentVar, setCurrentVar] = useState<EnvironmentVariable>()

  const [showRemoveVarConfirm, setShowRemoveConfirm] = useState(false)
  const [cacheForDelete, setCacheForDelete] = useState<EnvironmentVariable>()

  const handleSave = (env: EnvironmentVariable) => {
    if (!currentVar)
      updateEnvList([env, ...envList])
    else
      updateEnvList(envList.map(e => e.name === currentVar.name ? env : e))
  }

  const getEffectedNodes = useCallback((env: EnvironmentVariable) => {
    const { getNodes } = store.getState()
    const allNodes = getNodes()
    return findUsedVarNodes(
      ['env', env.name],
      allNodes,
    )
  }, [store])

  const removeUsedVarInNodes = useCallback((env: EnvironmentVariable) => {
    const { getNodes, setNodes } = store.getState()
    const effectedNodes = getEffectedNodes(env)
    const newNodes = getNodes().map((node) => {
      if (effectedNodes.find(n => n.id === node.id))
        return updateNodeVars(node, ['env', env.name], [])

      return node
    })
    setNodes(newNodes)
  }, [getEffectedNodes, store])

  const handleDelete = useCallback((env: EnvironmentVariable) => {
    removeUsedVarInNodes(env)
    updateEnvList(envList.filter(e => e.name !== env.name))
    setCacheForDelete(undefined)
    setShowRemoveConfirm(false)
  }, [envList, removeUsedVarInNodes, updateEnvList])

  const deleteCheck = useCallback((env: EnvironmentVariable) => {
    const effectedNodes = getEffectedNodes(env)
    if (effectedNodes.length > 0) {
      setCacheForDelete(env)
      setShowRemoveConfirm(true)
    }
    else {
      handleDelete(env)
    }
  }, [getEffectedNodes, handleDelete])

  const secretValue = (value: string) => {
    return `${value.slice(0, 2)}********${value.slice(-2)}`
  }

  return (
    <div
      className={cn(
        'relative flex flex-col w-[400px] bg-gray-50 rounded-l-2xl h-full border border-black/2',
      )}
    >
      <div className='shrink-0 flex items-center justify-between p-4 pb-0 font-semibold text-gray-900'>
        {t('workflow.env.envPanelTitle')}
        <div className='flex items-center'>
          <div
            className='flex items-center justify-center w-6 h-6 cursor-pointer'
            onClick={() => setShowEnvPanel(false)}
          >
            <RiCloseLine className='w-4 h-4 text-gray-500' />
          </div>
        </div>
      </div>
      <div className='shrink-0 py-1 px-4 text-[13px] leading-4 text-gray-500'>{t('workflow.env.envDescription')}</div>
      <div className='shrink-0 px-4 pt-2 pb-3'>
        <Button variant='primary' onClick={() => setShowVariableModal(true)}>
          <RiAddLine className='mr-1 w-4 h-4' />
          <span className='text-[13px] font-medium'>{t('workflow.env.envPanelButton')}</span>
        </Button>
      </div>
      <div className='grow px-4 rounded-b-2xl overflow-y-auto'>
        {envList.map(env => (
          <div
            key={env.name}
            className='mb-1 px-2.5 py-2 bg-white rounded-lg border-[0.5px] border-black/8 shadow-xs'
          >
            <div className='flex items-center justify-between'>
              <div className='grow flex gap-1 items-center'>
                <Env className='w-4 h-4 text-[#7839EE]' />
                <div className='text-[13px] leading-4 text-gray-900 font-medium'>{env.name}</div>
                <div className='text-xs leading-4 text-gray-500 font-medium'>{capitalize(env.value_type)}</div>
                {env.value_type === 'secret' && <RiLock2Line className='w-3 h-3 text-gray-500' />}
              </div>
              <div className='shrink-0 flex gap-1 items-center text-gray-500'>
                <div className='p-1 rounded-lg cursor-pointer hover:bg-gray-200 hover:text-gray-700'>
                  <RiEditLine className='w-4 h-4' onClick={() => {
                    setCurrentVar(env)
                    setShowVariableModal(true)
                  }}/>
                </div>
                <div className='p-1 rounded-lg cursor-pointer hover:bg-red-100 hover:text-red-600'>
                  <RiDeleteBinLine className='w-4 h-4' onClick={() => deleteCheck(env)} />
                </div>
              </div>
            </div>
            <div className='text-xs text-gray-500 leading-4 truncate'>{env.value_type !== 'secret' ? env.value : secretValue(env.value)}</div>
          </div>
        ))}
      </div>
      {showVariableModal && (
        <div className='absolute top-0 left-[-352px] z-50'>
          <VariableModal
            env={currentVar}
            onSave={handleSave}
            onClose={() => {
              setShowVariableModal(false)
              setCurrentVar(undefined)
            }}
          />
        </div>
      )}
      <RemoveEffectVarConfirm
        isShow={showRemoveVarConfirm}
        onCancel={() => setShowRemoveConfirm(false)}
        onConfirm={() => cacheForDelete && handleDelete(cacheForDelete)}
      />
    </div>
  )
}

export default memo(EnvPanel)
