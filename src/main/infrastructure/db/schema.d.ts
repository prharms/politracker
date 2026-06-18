/** Clients - the organizations or individuals who hire the firm. */
export declare const clients: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'clients'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'clients'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'name'
        tableName: 'clients'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'clients'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/** Projects - the top-level engagement, linked to a client. */
export declare const projects: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'projects'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    clientId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'client_id'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'name'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    type: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'type'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    status: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'status'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    notes: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'notes'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    updatedAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'projects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/**
 * Project groups - optional intermediate level within a project.
 * Used as contests for Candidate Campaigns and bills/issues for Legislative Advocacy.
 */
export declare const projectGroups: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'project_groups'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'project_groups'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    projectId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'project_id'
        tableName: 'project_groups'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'name'
        tableName: 'project_groups'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'project_groups'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/**
 * Subjects - the research targets.
 * Candidates, legislators, organizations, individuals, or ballot measures.
 */
export declare const subjects: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'subjects'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    projectId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'project_id'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    groupId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'group_id'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'name'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    type: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'type'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    role: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'role'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    status: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'status'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    notes: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'notes'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    updatedAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'subjects'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/** Staff - the researchers and writers on the team. */
export declare const staff: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'staff'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'staff'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    name: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'name'
        tableName: 'staff'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    status: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'status'
        tableName: 'staff'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'staff'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/**
 * Deliverables - the final work products: Reports, Memos, and Other.
 * Can be scoped to the whole project, a project group, or a specific subject.
 * Supports nesting via parent_deliverable_id (e.g. memos that roll up into a report).
 */
export declare const deliverables: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'deliverables'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    projectId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'project_id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    parentDeliverableId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'parent_deliverable_id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    groupId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'group_id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    subjectId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'subject_id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    staffId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'staff_id'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    type: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'type'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    title: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'title'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    status: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'status'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    dueDate: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'due_date'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    notes: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'notes'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    updatedAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'deliverables'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
/**
 * Tasks - the atomic unit of work.
 * task_type = Research: a research assignment against a subject.
 * task_type = Document: a writing assignment that IS a document in a deliverable.
 * All documents are tasks; not all tasks are documents.
 */
export declare const tasks: import('drizzle-orm/sqlite-core').SQLiteTableWithColumns<{
  name: 'tasks'
  schema: undefined
  columns: {
    id: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'id'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: true
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    subjectId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'subject_id'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    staffId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'staff_id'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    taskType: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'task_type'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    deliverableId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'deliverable_id'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    parentDocumentId: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'parent_document_id'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    sortOrder: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'sort_order'
        tableName: 'tasks'
        dataType: 'number'
        columnType: 'SQLiteInteger'
        data: number
        driverParam: number
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: undefined
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {}
    >
    title: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'title'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    category: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'category'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    status: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'status'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    priority: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'priority'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    dueDate: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'due_date'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    notes: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'notes'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    closedAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'closed_at'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: false
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    createdAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'created_at'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
    updatedAt: import('drizzle-orm/sqlite-core').SQLiteColumn<
      {
        name: 'updated_at'
        tableName: 'tasks'
        dataType: 'string'
        columnType: 'SQLiteText'
        data: string
        driverParam: string
        notNull: true
        hasDefault: false
        isPrimaryKey: false
        isAutoincrement: false
        hasRuntimeDefault: false
        enumValues: [string, ...string[]]
        baseColumn: never
        identity: undefined
        generated: undefined
      },
      {},
      {
        length: number | undefined
      }
    >
  }
  dialect: 'sqlite'
}>
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectGroup = typeof projectGroups.$inferSelect
export type NewProjectGroup = typeof projectGroups.$inferInsert
export type Subject = typeof subjects.$inferSelect
export type NewSubject = typeof subjects.$inferInsert
export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert
export type Deliverable = typeof deliverables.$inferSelect
export type NewDeliverable = typeof deliverables.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
