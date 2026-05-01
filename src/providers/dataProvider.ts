import type {
  DataProvider,
  GetListParams,
  GetListResult,
  RaRecord,
  DeleteParams,
  DeleteResult,
  Identifier,
} from "react-admin";
import { httpJson } from "../utils/http";

export const dataProvider: DataProvider = {
  // важно: сигнатура совместима с DataProvider
  getList: async (
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RaRecord>> => {
    const isFavorites = resource === "upwork-jobs-favorites";
    const isCountries = resource === "upwork-job-countries";

    if (isCountries) {
      const json = await httpJson(`/api/upwork-jobs/countries`);
      return {
        data: (json || []) as RaRecord[],
        total: (json || []).length,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    if (resource === "stacks") {
      const page = params?.pagination?.page ?? 1;
      const perPage = params?.pagination?.perPage ?? 50;
      const sort = params?.sort?.field ?? "name";
      const order = params?.sort?.order ?? "ASC";
      const filter = encodeURIComponent(JSON.stringify(params?.filter ?? {}));
      const json = await httpJson(
        `/api/stacks?page=${page}&page_size=${perPage}&sort=${encodeURIComponent(String(sort))}&order=${encodeURIComponent(String(order))}&filter=${filter}`
      );
      return {
        data: (json.items || []) as RaRecord[],
        total: Number(json.total ?? 0),
        pageInfo: {
          hasNextPage: page * perPage < Number(json.total ?? 0),
          hasPreviousPage: page > 1,
        },
      };
    }

    const isJobApplications = resource === "job-applications";

    if (isJobApplications) {
      const page = params?.pagination?.page ?? 1;
      const perPage = params?.pagination?.perPage ?? 20;
      const sort = params?.sort?.field ?? "updated_at";
      const order = params?.sort?.order ?? "DESC";
      const filter = encodeURIComponent(JSON.stringify(params?.filter ?? {}));
      const json = await httpJson(
        `/api/job-applications?page=${page}&page_size=${perPage}&sort=${encodeURIComponent(String(sort))}&order=${encodeURIComponent(String(order))}&filter=${filter}`
      );

      return {
        data: (json.items || []) as RaRecord[],
        total: Number(json.total ?? 0),
        pageInfo: {
          hasNextPage: page * perPage < Number(json.total ?? 0),
          hasPreviousPage: page > 1,
        },
      };
    }

    if (resource !== "upwork-jobs" && !isFavorites) {
      throw new Error("unsupported resource");
    }

    const page = params?.pagination?.page ?? 1;
    const perPage = params?.pagination?.perPage ?? 20;

    const filterObj = {
      ...(params?.filter ?? {}),
      ...(isFavorites ? { favorite: true } : {}),
    };

    const filter = encodeURIComponent(JSON.stringify(filterObj));
    const sort = params?.sort?.field ?? "id";
    const order = params?.sort?.order ?? "DESC";

    const url =
      `/api/upwork-jobs` +
      `?page=${page}` +
      `&page_size=${perPage}` +
      `&sort=${encodeURIComponent(String(sort))}` +
      `&order=${encodeURIComponent(String(order))}` +
      `&filter=${filter}`;

    const json = await httpJson(url);

    const items = (json.items || []).map((r: any) => ({
      ...r,
      scraped_at: r.scraped_at ? new Date(r.scraped_at).toISOString() : null,
    })) as RaRecord[];

    const total = Number(json.total ?? items.length);
    const hasNextPage = page * perPage < total;

    return {
      data: items,
      total,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: page > 1,
      },
    };
  },


  // Заглушки — добавим при появлении эндпоинтов
  getOne: async (resource, params) => {
    if (resource === "stacks") {
      const res = await httpJson(`/api/stacks/${params.id}`);
      return { data: res };
    }
    if (resource === "job-applications") {
      const res = await httpJson(`/api/job-applications/${params.id}`);
      return { data: res };
    }
    if (resource !== "upwork-jobs") throw new Error("unsupported resource");
    const res = await httpJson(`/api/upwork-jobs/${params.id}`);
    return { data: res };
  },
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  create: async (resource, params) => {
    if (resource === "stacks") {
      const res = await httpJson(`/api/stacks`, {
        method: "POST",
        body: JSON.stringify({ name: String(params.data?.name ?? "").trim() }),
        headers: { "Content-Type": "application/json" },
      });
      return { data: res as RaRecord };
    }
    if (resource === "job-applications") {
      const res = await httpJson(`/api/job-applications`, {
        method: "POST",
        body: JSON.stringify(params.data ?? {}),
        headers: { "Content-Type": "application/json" },
      });
      return { data: res as RaRecord };
    }
    throw new Error("create not implemented");
  },
  async update<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: any
  ) {
    if (resource === "stacks") {
      const body: Record<string, unknown> = {};
      if (params.data?.name !== undefined) {
        body.name = String(params.data.name ?? "").trim();
      }
      const res = await httpJson(`/api/stacks/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      return { data: res as RecordType };
    }
    if (resource === "job-applications") {
      const res = await httpJson(`/api/job-applications/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(params.data ?? {}),
        headers: { "Content-Type": "application/json" },
      });
      return { data: res as RecordType };
    }

    if (resource !== "upwork-jobs") throw new Error("unsupported resource");

    const res = await httpJson(`/api/upwork-jobs/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(params.data ?? {}),
      headers: { "Content-Type": "application/json" },
    });

    return { data: res as RecordType };
  },
  async delete<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>> {
    if (resource !== "upwork-jobs" && resource !== "job-applications" && resource !== "stacks") throw new Error("unsupported resource");

    let id: Identifier = params.id as Identifier;
    const deleteUrl =
      resource === "stacks"
        ? `/api/stacks/${id}`
        : resource === "job-applications"
        ? `/api/job-applications/${id}`
        : `/api/upwork-jobs/${id}`;
    try {
      const res = await httpJson(deleteUrl, {
        method: "DELETE",
      });
      // если сервер вернул 200 { id }
      if (res && typeof res === "object" && "id" in res) {
        id = (res.id as Identifier) ?? id;
      }
    } catch (e: any) {
      // httpJson обычно бросает с detail/body — прокинем читаемую ошибку
      throw new Error(e?.message || `Failed to delete id=${id}`);
    }

    // RA требует data: RecordType → вернём минимально допустимый объект с id
    return { data: ({ id } as unknown) as RecordType };
  },
  
  deleteMany: async () => ({ data: [] }),
  updateMany: async () => ({ data: [] }),
};
