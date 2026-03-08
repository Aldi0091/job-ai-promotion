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
    if (resource !== "upwork-jobs") throw new Error("unsupported resource");
    const res = await httpJson(`/api/upwork-jobs/${params.id}`);
    return { data: res };
  },
  getMany: async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  create: async () => {
    throw new Error("create not implemented");
  },
  async update<RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: any
  ) {
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
    if (resource !== "upwork-jobs") throw new Error("unsupported resource");

    // ⚠️ важное: используем httpJson, чтобы попасть на правильный бекенд-хост
    let id: Identifier = params.id as Identifier;
    try {
      const res = await httpJson(`/api/upwork-jobs/${id}`, {
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
