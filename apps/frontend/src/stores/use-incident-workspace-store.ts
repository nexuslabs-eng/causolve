import { create } from "zustand";

type CommandCenterTab = "overview" | "hypothesis" | "evidence" | "timeline" | "remediation";

type IncidentWorkspaceStore = {
  activeTab: CommandCenterTab;
  selectedHypothesisId: string | null;
  selectedEvidenceId: string | null;

  setActiveTab: (tab: CommandCenterTab) => void;
  selectHypothesis: (id: string | null) => void;
  selectEvidence: (id: string | null) => void;

  resetWorkspace: () => void;
};

const initialState = {
  activeTab: "overview" as CommandCenterTab,
  selectedHypothesisId: null,
  selectedEvidenceId: null,
};

export const useIncidentWorkspaceStore = create<IncidentWorkspaceStore>((set) => ({
  ...initialState,

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  selectHypothesis: (selectedHypothesisId) => {
    set({ selectedHypothesisId });
  },

  selectEvidence: (selectedEvidenceId) => {
    set({ selectedEvidenceId });
  },

  resetWorkspace: () => {
    set(initialState);
  },
}));
