import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useHospitalStore = create(
  persist(
    (set, get) => ({
      hospitalId: null,
      hospitalName: null,
      stats: null,
      departments: [],
      isLoading: false,
      error: null,

      setHospital: (id, name) => set({ hospitalId: id, hospitalName: name }),

      setStats: (stats) => set({ stats }),

      setDepartments: (departments) => set({ departments }),

      clearHospital: () =>
        set({
          hospitalId: null,
          hospitalName: null,
          stats: null,
          departments: [],
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateBudget: (budget) =>
        set((state) => ({
          stats: state.stats
            ? {
                ...state.stats,
                hospital: { ...state.stats.hospital, budget },
              }
            : null,
        })),
    }),
    {
      name: 'hospital-store',
      partialState: (state) => ({
        hospitalId: state.hospitalId,
        hospitalName: state.hospitalName,
      }),
    }
  )
)