'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCloseLine } from '@remixicon/react'
import { ArrowNarrowLeft } from '../../base/icons/src/vender/line/arrows'
import TracingPanel from './tracing-panel'
import cn from '@/utils/classnames'
import type { NodeTracing } from '@/types/workflow'
const i18nPrefix = 'workflow.singleRun'

type Props = {
  list: NodeTracing[][]
  onHide: () => void
  onBack: () => void
  noWrap?: boolean
}

const IterationResultPanel: FC<Props> = ({
  list,
  onHide,
  onBack,
  noWrap,
}) => {
  const { t } = useTranslation()

  const main = (
    <>
      <div className={cn(!noWrap && 'shrink-0 ', 'pl-4 pr-3 pt-3')}>
        <div className='shrink-0 flex justify-between items-center h-8'>
          <div className='text-base font-semibold text-gray-900 truncate'>
            {t(`${i18nPrefix}.testRunIteration`)}
          </div>
          <div className='ml-2 shrink-0 p-1 cursor-pointer' onClick={onHide}>
            <RiCloseLine className='w-4 h-4 text-text-tertiary ' />
          </div>
        </div>
        <div className='flex items-center py-2 space-x-1 text-text-accent cursor-pointer' onClick={onBack}>
          <ArrowNarrowLeft className='w-4 h-4' />
          <div className='leading-[18px] text-[13px] font-medium'>{t(`${i18nPrefix}.back`)}</div>
        </div>
      </div>
      {/* List */}
      <div className={cn(!noWrap ? 'h-0 grow' : 'max-h-full', 'overflow-y-auto px-4 pb-4 bg-gray-50')}>
        {list.map((iteration, index) => (
          <TracingPanel
            list={iteration}
            key={index}
          />
        ))}
      </div>
    </>
  )
  const handleNotBubble = useCallback((e: React.MouseEvent) => {
    // if not do this, it will trigger the message log modal disappear(useClickAway)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }, [])

  if (noWrap)
    return main

  return (
    <div
      className='absolute inset-0 z-10 rounded-2xl pt-10'
      style={{
        backgroundColor: 'rgba(16, 24, 40, 0.20)',
      }}
      onClick={handleNotBubble}
    >
      <div className='h-full rounded-2xl bg-white flex flex-col'>
        {main}
      </div>
    </div >
  )
}
export default React.memo(IterationResultPanel)
