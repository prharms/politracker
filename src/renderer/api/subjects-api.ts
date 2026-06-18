import type {
  SubjectDto,
  NewSubjectInput,
  UpdateSubjectInput,
  DeleteSubjectResult
} from '../../shared/dtos/subject-dto'

/** Fetch all subjects, optionally filtered by project. */
export function apiListSubjects(projectId?: string): Promise<SubjectDto[]> {
  return window.api.subjects.list(projectId)
}

/** Create a new subject. */
export function apiCreateSubject(input: NewSubjectInput): Promise<SubjectDto> {
  return window.api.subjects.create(input)
}

/** Update a subject. */
export function apiUpdateSubject(id: string, input: UpdateSubjectInput): Promise<SubjectDto> {
  return window.api.subjects.update(id, input)
}

/** Delete a subject. */
export function apiDeleteSubject(id: string): Promise<DeleteSubjectResult> {
  return window.api.subjects.delete(id)
}
