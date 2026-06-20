import type {
  SubprojectDto,
  NewSubprojectInput,
  UpdateSubprojectInput,
  DeleteSubprojectResult
} from '../../shared/dtos/subproject-dto'

/** Fetch subprojects, optionally filtered by project. */
export function apiListSubprojects(projectId?: string): Promise<SubprojectDto[]> {
  return window.api.subprojects.list(projectId)
}

/** Create a new subproject. */
export function apiCreateSubproject(input: NewSubprojectInput): Promise<SubprojectDto> {
  return window.api.subprojects.create(input)
}

/** Update a subproject. */
export function apiUpdateSubproject(
  id: string,
  input: UpdateSubprojectInput
): Promise<SubprojectDto> {
  return window.api.subprojects.update(id, input)
}

/** Delete a subproject. */
export function apiDeleteSubproject(id: string): Promise<DeleteSubprojectResult> {
  return window.api.subprojects.delete(id)
}
