import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Segmented,
  Space,
  Typography,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ListingType } from "@/router/routes";
import { routes } from "@/router/routes";
import { api } from "@/shared/api/api";
import { useAuthStore } from "@/store/auth/useAuthStore";
import type { RcFile } from "antd/es/upload";
import "./AdEditorPage.css";

const { Title, Text } = Typography;

type Props = {
  mode: "create" | "edit";
};

type JobMode = "vacancy" | "resume";

type FormValues = {
  type: ListingType;
  jobMode?: JobMode;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  salary?: number;
};

function ensureListingType(value: unknown): ListingType {
  return value === "services" || value === "jobs" ? value : "products";
}

export function AdEditorPage(props: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const { user, refreshMe } = useAuthStore();

  const [form] = Form.useForm<FormValues>();

  const [messageApi, contextHolder] = message.useMessage();

  const mode = props.mode;
  const typeFromParams = ensureListingType(params.type);
  const idFromParams = params.id ? Number(params.id) : undefined;

  const [type, setType] = useState<ListingType>(typeFromParams);
  const [jobMode, setJobMode] = useState<JobMode>("vacancy");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [productId, setProductId] = useState<number | null>(
    mode === "edit" ? idFromParams ?? null : null
  );
  const [productPhotoUrls, setProductPhotoUrls] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);

  const canEdit = Boolean(user?.id);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (mode === "create") {
      form.setFieldsValue({
        type,
        jobMode,
        title: "",
        description: "",
        category: "",
        price: undefined,
        salary: undefined,
      });
    }
  }, [mode, form, type, jobMode]);

  const showPrice = useMemo(
    () => type === "products" || type === "services",
    [type]
  );
  const showSalary = useMemo(() => type === "jobs", [type]);
  const showJobMode = type === "jobs";

  useEffect(() => {
    if (mode !== "edit") return;
    if (!idFromParams) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      if (typeFromParams === "products") return api.products.get(idFromParams);
      if (typeFromParams === "services") return api.services.get(idFromParams);

      // jobs
      if (jobMode === "resume") return api.resumes.get(idFromParams);
      return api.jobs.get(idFromParams);
    };

    load()
      .then((data) => {
        if (cancelled) return;
        const x =
          typeof data === "object" && data !== null
            ? (data as Record<string, unknown>)
            : {};

        const title = typeof x.title === "string" ? x.title : "";
        const description =
          typeof x.description === "string" ? x.description : "";
        const category = typeof x.category === "string" ? x.category : "";
        const price = typeof x.price === "number" ? x.price : undefined;
        const salary = typeof x.salary === "number" ? x.salary : undefined;

        const photoUrls = Array.isArray(x.photoUrls)
          ? x.photoUrls.filter((u): u is string => typeof u === "string")
          : [];

        setType(typeFromParams);
        if (typeFromParams === "products") {
          setProductId(idFromParams);
          setProductPhotoUrls(photoUrls.slice(0, 10));
        }

        form.setFieldsValue({
          type: typeFromParams,
          jobMode,
          title,
          description,
          category,
          price,
          salary,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Не удалось загрузить объявление"
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, idFromParams, typeFromParams, jobMode, form]);

  const onSubmit = async (values: FormValues) => {
    setError(null);

    if (!user?.id) {
      setError("Нужно войти, чтобы создавать/редактировать объявления");
      return;
    }

    setIsLoading(true);
    try {
      if (values.type === "products") {
        if (mode === "create") {
          const created = (await api.products.create({
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price ?? 0,
            userId: user.id,
            photoUrls: [],
          })) as unknown as { id?: number };

          if (created?.id) {
            setProductId(created.id);
          }
        } else if (idFromParams) {
          await api.products.update(idFromParams, {
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          });
        }
      }

      if (values.type === "services") {
        if (mode === "create") {
          await api.services.create({
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          });
        } else if (idFromParams) {
          await api.services.update(idFromParams, {
            title: values.title,
            description: values.description,
            category: values.category,
            price: values.price,
            userId: user.id,
          });
        }
      }

      if (values.type === "jobs") {
        if (values.jobMode === "resume") {
          if (mode === "create") {
            await api.resumes.create({
              title: values.title,
              description: values.description,
              category: values.category,
              skills: values.salary ? String(values.salary) : undefined,
              userId: user.id,
            });
          } else if (idFromParams) {
            await api.resumes.update(idFromParams, {
              title: values.title,
              description: values.description,
              category: values.category,
              skills: values.salary ? String(values.salary) : undefined,
              userId: user.id,
            });
          }
        } else {
          if (mode === "create") {
            await api.jobs.create({
              title: values.title,
              description: values.description,
              category: values.category,
              salary: values.salary,
              userId: user.id,
            });
          } else if (idFromParams) {
            await api.jobs.update(idFromParams, {
              title: values.title,
              description: values.description,
              category: values.category,
              salary: values.salary,
              userId: user.id,
            });
          }
        }
      }

      if (
        mode === "create" &&
        values.type === "products" &&
        productPhotoUrls.length === 0
      ) {
        messageApi.success("Товар создан. Добавьте фотографии");
        return;
      }

      navigate(routes.listings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setIsLoading(false);
    }
  };

  function validateImage(file: RcFile): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Поддерживаются только JPEG, PNG или WEBP";
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return "Максимальный размер файла — 5 МБ";
    }

    return null;
  }

  const productPhotoFileList = useMemo<UploadFile[]>(() => {
    return productPhotoUrls.slice(0, 10).map((url, index) => ({
      uid: `${index}:${url}`,
      name: url.split("/").pop() ?? "photo",
      status: "done",
      url,
    }));
  }, [productPhotoUrls]);

  const productPhotosUploadProps: UploadProps = {
    accept: "image/jpeg,image/png,image/webp",
    listType: "picture-card",
    fileList: productPhotoFileList,
    maxCount: 10,
    multiple: true,
    disabled: !canEdit || isLoading || isUploadingPhotos || !productId,

    beforeUpload: (file) => {
      const error = validateImage(file);
      if (error) {
        setPhotosError(error);
        return Upload.LIST_IGNORE;
      }
      return true;
    },

    customRequest: async ({ file, onSuccess, onError }) => {
      if (!productId) {
        onError?.(new Error("Сначала сохраните товар"));
        return;
      }

      try {
        setIsUploadingPhotos(true);
        setPhotosError(null);

        const res = await api.products.uploadPhotos(productId, [
          file as RcFile,
        ]);

        const urls = Array.isArray(res)
          ? res
              .map((x) => (typeof x?.url === "string" ? x.url : null))
              .filter((u): u is string => Boolean(u))
          : [];

        setProductPhotoUrls((prev) => {
          const merged = [...prev, ...urls];
          return merged.slice(0, 10);
        });

        onSuccess?.({}, new XMLHttpRequest());
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Не удалось загрузить фото";
        setPhotosError(message);
        onError?.(new Error(message));
      } finally {
        setIsUploadingPhotos(false);
      }
    },

    onRemove: (file) => {
      const url = typeof file.url === "string" ? file.url : null;
      if (!url) return true;

      setProductPhotoUrls((prev) => prev.filter((u) => u !== url));
      // TODO: backend delete
      return true;
    },
  };

  const onDelete = () => {
    if (!idFromParams) return;

    Modal.confirm({
      title: "Удалить объявление?",
      content: "Это действие нельзя отменить",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      async onOk() {
        try {
          setIsLoading(true);

          if (type === "products") {
            await api.products.delete(idFromParams);
          }

          if (type === "services") {
            await api.services.delete(idFromParams);
          }

          if (type === "jobs") {
            if (jobMode === "resume") {
              await api.resumes.delete(idFromParams);
            } else {
              await api.jobs.delete(idFromParams);
            }
          }

          messageApi.success("Объявление удалено");
          navigate(routes.listings);
        } catch (e) {
          messageApi.error(
            e instanceof Error ? e.message : "Не удалось удалить объявление"
          );
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="adEditorPage">
      {contextHolder}
      <Card loading={isLoading}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            {mode === "create"
              ? "Создать объявление"
              : "Редактировать объявление"}
          </Title>

          {!canEdit ? (
            <Alert
              type="warning"
              showIcon
              title="Нужно войти, чтобы размещать объявления"
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={() => navigate(routes.login)}
                >
                  Войти
                </Button>
              }
            />
          ) : null}

          {error ? <Alert type="error" title={error} showIcon /> : null}
          {photosError ? (
            <Alert type="error" title={photosError} showIcon />
          ) : null}

          <Form<FormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ type, jobMode, title: "" }}
            onFinish={onSubmit}
          >
            <Form.Item label="Тип" name="type" rules={[{ required: true }]}>
              <Segmented<ListingType>
                value={type}
                options={[
                  { label: "Товары", value: "products" },
                  { label: "Услуги", value: "services" },
                  { label: "Работа", value: "jobs" },
                ]}
                onChange={(v) => {
                  setType(v);
                  form.setFieldValue("type", v);
                }}
              />
            </Form.Item>

            {showJobMode ? (
              <Form.Item
                label="Раздел"
                name="jobMode"
                rules={[{ required: true }]}
              >
                <Segmented<JobMode>
                  value={jobMode}
                  options={[
                    { label: "Ищу работника", value: "vacancy" },
                    { label: "Ищу работу", value: "resume" },
                  ]}
                  onChange={(v) => {
                    setJobMode(v);
                    form.setFieldValue("jobMode", v);
                  }}
                />
              </Form.Item>
            ) : null}

            <Form.Item
              name="title"
              label="Название"
              rules={[{ required: true }]}
            >
              <Input placeholder="Например: Плотник на сезон / Ищу работу плотником" />
            </Form.Item>

            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item name="category" label="Категория">
              <Input />
            </Form.Item>

            {type === "products" ? (
              <Form.Item
                label="Фото товара (до 10)"
                extra={
                  productId
                    ? "Можно перетащить или выбрать файлы"
                    : "Сначала нажмите «Сохранить», затем добавляйте фото"
                }
              >
                <Upload {...productPhotosUploadProps}>
                  {productPhotoFileList.length >= 10 ? null : (
                    <div>
                      <div style={{ marginBottom: 8 }}>+</div>
                      <div style={{ fontSize: 12 }}>Загрузить</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            ) : null}

            {showPrice ? (
              <Form.Item name="price" label="Цена">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            ) : null}

            {showSalary ? (
              <Form.Item name="salary" label="Оплата">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            ) : null}

            <Space wrap>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!canEdit}
                loading={isLoading}
              >
                Сохранить
              </Button>

              {mode === "edit" ? (
                <Button danger onClick={onDelete} loading={isLoading}>
                  Удалить
                </Button>
              ) : null}

              <Button onClick={() => navigate(-1)}>Назад</Button>

              <Text type="secondary">
                Родовая Ярмарка — про ясность и доверие
              </Text>
            </Space>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
