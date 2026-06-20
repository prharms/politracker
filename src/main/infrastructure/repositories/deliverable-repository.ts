import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import { deliverables, projects } from '../db/schema'
import type { DeliverableRepositoryPort } from '../../application/ports/deliverable-repository-port'
import type { DeliverableDto, NewDeliverableInput } from '../../../shared/dtos/deliverable-dto'
import type { DeliverableType, DeliverableStatus } from '../../../shared/constants'

type DeliverableRow = {
  id: string
  projectId: string
  projectName: string | null
  parentDeliverableId: string | null
  subprojectId: string | null
  type: string
  title: string
  status: string
  dueDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** Drizzle-backed repository implementing DeliverableRepositoryPort. */
export class DeliverableRepository implements DeliverableRepositoryPort {
  /** Construct with a Drizzle database instance. */
  constructor(private readonly db: BetterSQLite3Database) {}

  /** Return all deliverables for a project with project name joined. */
  listByProject(projectId: string): DeliverableDto[] {
    return this.queryJoined()
      .filter(r => r.projectId === projectId)
      .map(toDto)
  }

  /** Return all deliverables across all projects. */
  listAll(): DeliverableDto[] {
    return this.queryJoined().map(toDto)
  }

  /** Return a single deliverable by id, or null if not found. */
  findById(id: string): DeliverableDto | null {
    const rows = this.queryJoined().filter(r => r.id === id)
    return rows.length > 0 ? toDto(rows[0]!) : null
  }

  /** Persist a new deliverable and return it. */
  create(input: NewDeliverableInput): DeliverableDto {
    const now = new Date().toISOString()
    const id = randomUUID()
    this.db
      .insert(deliverables)
      .values({
        id,
        projectId: input.projectId,
        parentDeliverableId: input.parentDeliverableId ?? null,
        subprojectId: input.subprojectId ?? null,
        type: input.type,
        title: input.title,
        status: input.status,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now
      })
      .run()
    return this.findById(id)!
  }

  /** Execute the base join query and return raw rows. */
  private queryJoined(): DeliverableRow[] {
    return this.db
      .select({
        id: deliverables.id,
        projectId: deliverables.projectId,
        projectName: projects.name,
        parentDeliverableId: deliverables.parentDeliverableId,
        subprojectId: deliverables.subprojectId,
        type: deliverables.type,
        title: deliverables.title,
        status: deliverables.status,
        dueDate: deliverables.dueDate,
        notes: deliverables.notes,
        createdAt: deliverables.createdAt,
        updatedAt: deliverables.updatedAt
      })
      .from(deliverables)
      .leftJoin(projects, eq(deliverables.projectId, projects.id))
      .orderBy(deliverables.title)
      .all() as DeliverableRow[]
  }
}

/** Map a raw join row to a DeliverableDto. */
function toDto(row: DeliverableRow): DeliverableDto {
  return {
    id: row.id,
    projectId: row.projectId,
    projectName: row.projectName ?? '',
    parentDeliverableId: row.parentDeliverableId,
    subprojectId: row.subprojectId,
    type: row.type as DeliverableType,
    title: row.title,
    status: row.status as DeliverableStatus,
    dueDate: row.dueDate,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
