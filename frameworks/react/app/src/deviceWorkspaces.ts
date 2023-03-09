const deviceWorkspaces = (() => {
  function saveWorkspaces() {
    localStorage.setItem('-workspaces-', JSON.stringify(Array.from(workspaces)));
  }

  let workspaces: Set<string>;
  let lastWorkspace = localStorage.getItem('-last-workspace-');
  try {
    workspaces = new Set(JSON.parse(localStorage.getItem('-workspaces-') || '[]'));
  } catch (e) {
    console.error(e);
    workspaces = new Set();
  }

  return {
    get list() {
      return workspaces;
    },

    get lastWorkspace() {
      return lastWorkspace;
    },

    add(name: string) {
      workspaces.add(name);
      saveWorkspaces();
      lastWorkspace = name;
      localStorage.setItem('-last-workspace-', name);
    },

    remove(name: string) {
      workspaces.delete(name);
      saveWorkspaces();
    },
  };
})();

export default deviceWorkspaces;
