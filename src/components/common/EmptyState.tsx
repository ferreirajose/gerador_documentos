import { RiPlayCircleFill } from '@remixicon/react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
        <RiPlayCircleFill className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Nenhum workflow para executar
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
        Crie nós e conexões no editor primeiro para poder executar um workflow.
      </p>
    </div>
  )
}