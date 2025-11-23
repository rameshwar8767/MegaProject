const getProjects = asyncHandler(async(req,res)=>{});

const getProjectById = asyncHandler(async(req,res)=>{});

const createProject = asyncHandler(async(req,res)=>{});

const updateProject = asyncHandler(async(req,res)=>{});

const deleteProject = asyncHandler(async(req,res)=>{});

const addMemberToProject = asyncHandler(async(req,res)=>{});

const removeMemberFromProject = asyncHandler(async(req,res)=>{});

const getProjectMembers = asyncHandler(async(req,res)=>{});

const updateProjectMemberRole = asyncHandler(async(req,res)=>{});

const deleteProjectMember = asyncHandler(async(req,res)=>{});

export {getProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject, getProjectMembers, updateProjectMemberRole, deleteProjectMember};