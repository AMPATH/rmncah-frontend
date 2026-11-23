import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import type {
  TrainingModule,
  TrainingSection,
  LearningMaterial,
} from '../models'

import {
  curriculumService,
} from '../services/curriculum.service'

import type {
  CurriculumData,
} from '../services/curriculum.service'

import {
  CurriculumContext,
} from './CurriculumContext'

import type {
  CurriculumContextValue,
} from './CurriculumContext'

interface CurriculumProviderProps {
  children: ReactNode
}

const EMPTY_CURRICULUM: CurriculumData = {
  modules: [],
  sections: [],
  materials: [],
}

export function CurriculumProvider({
  children,
}: CurriculumProviderProps) {
  const [curriculum, setCurriculum] =
    useState<CurriculumData>(EMPTY_CURRICULUM)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load curriculum records from the JSON Server API.
  useEffect(() => {
    let cancelled = false

    async function loadCurriculum() {
      try {
        setLoading(true)
        setError(null)

        const data = await curriculumService.initialize()

        if (!cancelled) {
          setCurriculum(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load the EmONC curriculum.'

          setError(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCurriculum()

    return () => {
      cancelled = true
    }
  }, [])

  // Reload all curriculum records.
  const refresh = useCallback(async () => {
    try {
      setError(null)

      const data = await curriculumService.getAll()

      setCurriculum(data)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to refresh the EmONC curriculum.'

      setError(message)
      throw err
    }
  }, [])

  // Training modules
  const createModule = useCallback(
    async (record: TrainingModule) => {
      try {
        setError(null)

        const created = await curriculumService.createModule(record)

        setCurriculum((previous) => ({
          ...previous,
          modules: [...previous.modules, created],
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to create the training module.',
        )
        throw err
      }
    },
    [],
  )

  const updateModule = useCallback(
    async (id: string, changes: Partial<TrainingModule>) => {
      try {
        setError(null)

        const updated = await curriculumService.updateModule(id, changes)

        setCurriculum((previous) => ({
          ...previous,
          modules: previous.modules.map((module) =>
            module.id === id ? updated : module,
          ),
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to update the training module.',
        )
        throw err
      }
    },
    [],
  )

  const deleteModule = useCallback(async (id: string) => {
    try {
      setError(null)

      await curriculumService.deleteModule(id)

      setCurriculum((previous) => ({
        ...previous,
        modules: previous.modules.filter((module) => module.id !== id),
      }))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete the training module.',
      )
      throw err
    }
  }, [])

  // Module sections
  const createSection = useCallback(
    async (record: TrainingSection) => {
      try {
        setError(null)

        const created = await curriculumService.createSection(record)

        setCurriculum((previous) => ({
          ...previous,
          sections: [...previous.sections, created],
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to create the module section.',
        )
        throw err
      }
    },
    [],
  )

  const updateSection = useCallback(
    async (id: string, changes: Partial<TrainingSection>) => {
      try {
        setError(null)

        const updated = await curriculumService.updateSection(id, changes)

        setCurriculum((previous) => ({
          ...previous,
          sections: previous.sections.map((section) =>
            section.id === id ? updated : section,
          ),
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to update the module section.',
        )
        throw err
      }
    },
    [],
  )

  const deleteSection = useCallback(async (id: string) => {
    try {
      setError(null)

      await curriculumService.deleteSection(id)

      setCurriculum((previous) => ({
        ...previous,
        sections: previous.sections.filter((section) => section.id !== id),
      }))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete the module section.',
      )
      throw err
    }
  }, [])

  // Reorder sections while keeping their module relationships.
  const reorderSections = useCallback(
    async (sections: TrainingSection[]) => {
      try {
        setError(null)

        const updatedSections = await Promise.all(
          sections.map((section, index) =>
            curriculumService.updateSection(section.id, {
              sequence: index + 1,
            }),
          ),
        )

        setCurriculum((previous) => {
          const updatedById = new Map(
            updatedSections.map((section) => [section.id, section]),
          )

          return {
            ...previous,
            sections: previous.sections.map(
              (section) => updatedById.get(section.id) ?? section,
            ),
          }
        })
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to reorder module sections.',
        )
        throw err
      }
    },
    [],
  )

  // Learning materials
  const createMaterial = useCallback(
    async (record: LearningMaterial) => {
      try {
        setError(null)

        const created = await curriculumService.createMaterial(record)

        setCurriculum((previous) => ({
          ...previous,
          materials: [...previous.materials, created],
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to create the learning material.',
        )
        throw err
      }
    },
    [],
  )

  const updateMaterial = useCallback(
    async (id: string, changes: Partial<LearningMaterial>) => {
      try {
        setError(null)

        const updated = await curriculumService.updateMaterial(id, changes)

        setCurriculum((previous) => ({
          ...previous,
          materials: previous.materials.map((material) =>
            material.id === id ? updated : material,
          ),
        }))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to update the learning material.',
        )
        throw err
      }
    },
    [],
  )

  const deleteMaterial = useCallback(async (id: string) => {
    try {
      setError(null)

      await curriculumService.deleteMaterial(id)

      setCurriculum((previous) => ({
        ...previous,
        materials: previous.materials.filter(
          (material) => material.id !== id,
        ),
      }))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete the learning material.',
      )
      throw err
    }
  }, [])

  // Expose curriculum data and operations through context.
  const value = useMemo<CurriculumContextValue>(
    () => ({
      ...curriculum,
      loading,
      error,
      refresh,
      createModule,
      updateModule,
      deleteModule,
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      createMaterial,
      updateMaterial,
      deleteMaterial,
    }),
    [
      curriculum,
      loading,
      error,
      refresh,
      createModule,
      updateModule,
      deleteModule,
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      createMaterial,
      updateMaterial,
      deleteMaterial,
    ],
  )

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  )
}
