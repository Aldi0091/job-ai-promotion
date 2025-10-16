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
    _resource: string,
    params: GetListParams
  ): Promise<GetListResult<RaRecord>> => {
    const page = params?.pagination?.page ?? 1;
    const perPage = params?.pagination?.perPage ?? 20;

    const json = await httpJson(
      `/api/upwork-jobs/?page=${page}&page_size=${perPage}`
    );

    // вернём как RaRecord[], чтобы пройти общий контракт
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
    } as GetListResult<RaRecord>;
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
  update: async () => {
    throw new Error("update not implemented");
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
