import React, { useEffect, useState, useCallback } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "components/loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import Breadcrumbs from "views/BackLink/BackButton";

// Loading spinner komponenti
const LoadingSpinner = ({ size = 4 }) => (
  <svg
    className={`h-${size} w-${size} animate-spin text-white`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Searchable select komponenti
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  isLoading = false,
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectId, setSubjectId] = useState([]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const fetchSubjects = async () => {
    try {
      const response = await ApiCall("/api/v1/student-subject/subjects", "GET");
      console.log(response.data);

      if (response.data) {
        const subjectsArray = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setSubjectId(subjectsArray);
      }
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Fanlarni olishda xatolik!");
    }
  };
  useEffect(() => {
    fetchSubjects();
  }, []);
  const handleSelect = (selectedValue, selectedLabel) => {
    onChange(selectedValue);
    setSearchTerm(selectedLabel);
    setIsOpen(false);
    if (onSearch) onSearch();
  };

  return (
    <div className="w-full md:w-1/4">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3">
              <LoadingSpinner size={4} />
            </div>
          )}
        </div>

        {isOpen && (
          <div className="ring-black absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Hech narsa topilmadi
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="relative cursor-default select-none py-2 px-3 text-gray-900 hover:bg-blue-100"
                  onClick={() => handleSelect(option.value, option.label)}
                >
                  <span className="block truncate font-normal">
                    {option.label}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Statistik karta komponenti
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-lg bg-white p-4 shadow transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
      </div>
      <div
        className={`rounded-full ${color.replace(
          "text",
          "bg"
        )} bg-opacity-20 p-3`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
);

function CurriculumTable() {
  const navigate = useNavigate();
  const [originalCurriculums, setOriginalCurriculums] = useState([]); // все предметы после выбора группы

  const [filters, setFilters] = useState({
    subjectId: "",
    departmentId: "",
    curriculumId: "",
    groupId: "", // ✅ добавлено
  });

  const handleClearFilters = () => {
    setFilters({
      subjectId: "",
      curriculumId: "",
      groupId: "",
    });
    setState((prev) => ({
      ...prev,
      currentPage: 0,
    }));
  };

  // 👇 Этот эффект сработает сразу после очистки фильтров
  useEffect(() => {
    // Проверяем, если фильтры пустые — загружаем всё
    if (!filters.subjectId && !filters.curriculumId && !filters.groupId) {
      fetchCurriculums();
    }
  }, [filters]);

  // State management
  const [state, setState] = useState({
    curriculums: [],
    totalSubjects: 0,
    isUpdating: false,
    isLoading: false,
    currentPage: 0,
    totalPages: 1,
    subjectId: "",
    departmentId: "",
    curriculumId: "",
  });

  const [selectOptions, setSelectOptions] = useState({
    subjects: [],
    groups: [],
    loading: {
      subjects: false,
      groups: false,
    },
  });
  const fetchGroups = async () => {
    setSelectOptions((prev) => ({
      ...prev,
      loading: { ...prev.loading, groups: true },
    }));

    try {
      const response = await ApiCall("/api/v1/groups", "GET");
      const groups = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.data || [];

      const mappedGroups = groups.map((g) => ({
        value: g.id ?? null, // id группы
        label: g.name ?? g.groupName ?? "Noma'lum guruh",
        curriculumId: g.curriculum ?? null, // curriculum ID
      }));

      setSelectOptions((prev) => ({
        ...prev,
        groups: mappedGroups,
      }));
    } catch (error) {
      console.error("❌ Guruhlarni olishda xatolik:", error);
      toast.error("Guruhlarni yuklashda xatolik");
    } finally {
      setSelectOptions((prev) => ({
        ...prev,
        loading: { ...prev.loading, groups: false },
      }));
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const PAGE_SIZE = 100;

  // API calls
  const fetchSelectOptions = useCallback(async () => {
    // Fanlarni olish
    setSelectOptions((prev) => ({
      ...prev,
      loading: { ...prev.loading, subjects: true },
    }));
    try {
      const subjectsResponse = await ApiCall("/api/v1/subjects", "GET");
      if (subjectsResponse?.data) {
        const subjects = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : subjectsResponse.data.content || subjectsResponse.data.data || [];

        setSelectOptions((prev) => ({
          ...prev,
          subjects: subjects.map((subject) => ({
            value: subject.id,
            label: subject.name || "Noma'lum fan",
          })),
        }));
      }
    } catch (error) {
      console.error("Fanlarni yuklashda xatolik:", error);
      toast.error("Fanlarni yuklashda xatolik");
    } finally {
      setSelectOptions((prev) => ({
        ...prev,
        loading: { ...prev.loading, subjects: false },
      }));
    }

    // Bo'limlarni olish
    setSelectOptions((prev) => ({
      ...prev,
      loading: { ...prev.loading, departments: true },
    }));
    try {
      const departmentsResponse = await ApiCall("/api/v1/departments", "GET");
      if (departmentsResponse?.data) {
        const departments = Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data
          : departmentsResponse.data.content ||
          departmentsResponse.data.data ||
          [];

        setSelectOptions((prev) => ({
          ...prev,
          departments: departments.map((department) => ({
            value: department.id,
            label: department.name || "Noma'lum bo'lim",
          })),
        }));
      }
    } catch (error) {
      console.error("Bo'limlarni yuklashda xatolik:", error);
      toast.error("Bo'limlarni yuklashda xatolik");
    } finally {
      setSelectOptions((prev) => ({
        ...prev,
        loading: { ...prev.loading, departments: false },
      }));
    }

    // O'quv rejalarni olish
    setSelectOptions((prev) => ({
      ...prev,
      loading: { ...prev.loading, curriculums: true },
    }));
    try {
      const curriculumsResponse = await ApiCall("/api/v1/curriculum", "GET");
      if (curriculumsResponse?.data) {
        const curriculums = Array.isArray(curriculumsResponse.data)
          ? curriculumsResponse.data
          : curriculumsResponse.data.content ||
          curriculumsResponse.data.data ||
          [];

        setSelectOptions((prev) => ({
          ...prev,
          curriculums: curriculums.map((curriculum) => ({
            value: curriculum.id,
            label: `${curriculum.educationYearName || "Noma'lum yil"} - ${curriculum.specialty?.name || "Noma'lum mutaxassislik"
              } - ${curriculum.educationTypeName}`,
          })),
        }));
      }
    } catch (error) {
      console.error("O'quv rejalarni yuklashda xatolik:", error);
      toast.error("O'quv rejalarni yuklashda xatolik");
    } finally {
      setSelectOptions((prev) => ({
        ...prev,
        loading: { ...prev.loading, curriculums: false },
      }));
    }
  }, []);

  const fetchCurriculums = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { currentPage } = state;
      const { subjectId, curriculumId } = filters;


      const url = `/api/v1/curriculum-subject/filter?subjectId=${subjectId || ""
        }&curriculumHemisId=${curriculumId || ""
        }&page=${currentPage}&size=${PAGE_SIZE}`;

      const response = await ApiCall(url, "GET");
      console.log(response.data);


      // ✅ Твой backend возвращает массив из объектов с полем .subject
      const arr = Array.isArray(response.data.content)
        ? response.data.content
        : [];

      if (arr.length > 0) {
        const mapped = arr.map((item) => {
          const cs = item.subject; // curriculum_subject
          const subj = cs?.subject || {}; // вложенный предмет

          return {
            id: cs.id,
            hemisId: cs.hemisId,
            code: subj.code,
            name: subj.name,
            department: cs.department,
            credit: cs.credit,
            totalAcload: cs.totalAcload,
            active: cs.active,
            test_count: item.test_count ?? 0,
            semesterName: cs.semesterName,
          };
        });

        setState((prev) => ({
          ...prev,
          curriculums: mapped,
          totalSubjects: response.data.totalElements ?? mapped.length,
          totalPages: response.data.totalPages ?? 1,
        }));
      } else {
        console.warn("⚠️ Пустой контент:", arr);
        setState((prev) => ({
          ...prev,
          curriculums: [],
          totalSubjects: 0,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const updateCurriculumsFromHemis = async () => {
    setState((prev) => ({ ...prev, isUpdating: true }));

    try {
      const response = await ApiCall(
        `/api/v1/curriculum-subject/update`,
        "GET"
      );

      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto'g'ri.");
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
        await fetchCurriculums();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Yangilashda xatolik yuz berdi.");
    } finally {
      setState((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < state.totalPages) {
      setState((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleInputChange = (field) => (value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const { subjectId } = filters;

    if (!subjectId) {
      // если предмет не выбран — показываем всё
      const mapped = originalCurriculums.map((item) => {
        const cs = item.subject;
        const subj = cs?.subject || {};
        return {
          id: cs.id,
          hemisId: cs.hemisId,
          code: subj.code,
          name: subj.name,
          department: cs.department,
          credit: cs.credit,
          totalAcload: cs.totalAcload,
          active: cs.active,
          test_count: item.test_count ?? 0,
          semesterName: cs.semesterName,
        };
      });
      setState((prev) => ({
        ...prev,
        curriculums: mapped,
        totalSubjects: mapped.length,
        totalPages: 1,
        currentPage: 0,
      }));
      return;
    }

    // 🔹 Фильтруем по выбранному предмету
    const filtered = originalCurriculums.filter(
      (item) => item.subject?.id === subjectId
    );

    const mappedFiltered = filtered.map((item) => {
      const cs = item.subject;
      const subj = cs?.subject || {};
      return {
        id: cs.id,
        hemisId: cs.hemisId,
        code: subj.code,
        name: subj.name,
        department: cs.department,
        credit: cs.credit,
        totalAcload: cs.totalAcload,
        active: cs.active,
        test_count: item.test_count ?? 0,
        semesterName: cs.semesterName,

      };
    });

    setState((prev) => ({
      ...prev,
      curriculums: mappedFiltered,
      totalSubjects: mappedFiltered.length,
      totalPages: 1,
      currentPage: 0,
    }));
  };

  // Effects
  useEffect(() => {
    fetchSelectOptions();
    fetchCurriculums();
  }, [fetchSelectOptions]);

  const {
    curriculums,
    totalSubjects,
    isUpdating,
    isLoading,
    currentPage,
    totalPages,
  } = state;

  return (
    <div className="min-h-screen p-4">
      <ToastContainer />
      <Breadcrumbs />
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700">
            O'quv Rejalar Ro'yxati
          </h1>
          <p className="mt-2 text-xl text-gray-700">
            Barcha fanlar va ularning ma'lumotlari
          </p>
        </div>

        {/* Update button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={updateCurriculumsFromHemis}
            disabled={isUpdating}
            className={`relative whitespace-nowrap rounded-lg px-16 py-4 text-sm font-medium text-white transition-all ${isUpdating
              ? "cursor-not-allowed bg-blue-600/80"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-2">Yangilanmoqda...</span>
              </span>
            ) : (
              "HEMISdan yangilash"
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <StatCard
            title="Jami Fanlar"
            value={totalSubjects}
            icon={(props) => (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                {...props}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477 4.5 1.253"
                />
              </svg>
            )}
            color="text-blue-600"
          />

          <StatCard
            title="Jami Sahifalar"
            value={totalPages}
            icon={(props) => (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                {...props}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
            color="text-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              {/* Guruh (group) */}
              <div className="w-full md:w-1/3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <Select
                  options={selectOptions.groups}
                  value={
                    filters.groupId
                      ? selectOptions.groups.find(
                        (opt) => opt.value === filters.groupId
                      )
                      : null
                  }
                  onChange={async (selected) => {
                    // 🧹 Если очищен выбор
                    if (!selected) {
                      setFilters((prev) => ({
                        ...prev,
                        groupId: "",
                        curriculumId: "",
                        subjectId: "",
                      }));
                      setSelectOptions((prev) => ({ ...prev, subjects: [] }));
                      setState((prev) => ({ ...prev, curriculums: [] }));
                      return;
                    }

                    const groupId = selected?.value || "";
                    const curriculumId = selected?.curriculumId || "";

                    // 🔹 Сбрасываем фильтры и таблицу перед новым запросом
                    setFilters((prev) => ({
                      ...prev,
                      groupId,
                      curriculumId,
                      subjectId: "",
                    }));

                    setState((prev) => ({
                      ...prev,
                      curriculums: [],
                      totalSubjects: 0,
                      totalPages: 1,
                    }));



                    if (curriculumId) {
                      try {
                        const response = await ApiCall(
                          `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}&size=${PAGE_SIZE}`,
                          "GET"
                        );

                        const content = response?.data?.content ?? [];

                        if (Array.isArray(content) && content.length > 0) {
                          // ✅ Все предметы, даже дубликаты
                          const subjects = content.map((item, index) => ({
                            value: `${item.subject?.id || "no-id"}-${index}`,
                            label:
                              item.subject?.subject?.name || "Noma'lum fan",
                            realId: item.subject?.id,
                          }));

                          // ✅ Сохраняем исходные данные
                          setOriginalCurriculums(content);

                          const mapped = content.map((item) => {
                            const cs = item.subject;
                            const subj = cs?.subject || {};
                            return {
                              id: cs.id,
                              hemisId: cs.hemisId,
                              code: subj.code,
                              name: subj.name,
                              department: cs.department,
                              credit: cs.credit,
                              totalAcload: cs.totalAcload,
                              active: cs.active,
                              test_count: item.test_count ?? 0,
                              semesterName: cs.semesterName,
                            };
                          });

                          setState((prev) => ({
                            ...prev,
                            curriculums: mapped,
                            totalSubjects: mapped.length,
                            totalPages: 1,
                            currentPage: 0,
                          }));

                          setSelectOptions((prev) => ({
                            ...prev,
                            subjects,
                          }));
                        } else {
                          setSelectOptions((prev) => ({
                            ...prev,
                            subjects: [],
                          }));
                        }
                      } catch (err) {
                        console.error("❌ Fanlarni olishda xatolik:", err);
                      }
                    }
                  }}
                  isSearchable
                  isClearable
                  placeholder="Guruhni tanlang"
                  isLoading={selectOptions.loading.groups}
                />
              </div>
              {/* Fan (subject) */}
              <div className="w-full md:w-1/3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fan
                </label>
                <Select
                  options={selectOptions.subjects}
                  value={
                    filters.subjectId
                      ? selectOptions.subjects.find(
                        (opt) => opt.value === filters.subjectId
                      )
                      : null
                  }
                  onChange={(selected) => {
                    const selectedId = selected?.realId || "";
                    setFilters((prev) => ({
                      ...prev,
                      subjectId: selectedId,
                      curriculumId: prev.curriculumId || "",
                    }));

                    if (!selectedId) {
                      const mapped = originalCurriculums.map((item) => {
                        const cs = item.subject;
                        const subj = cs?.subject || {};
                        return {
                          id: cs.id,
                          hemisId: cs.hemisId,
                          code: subj.code,
                          name: subj.name,
                          department: cs.department,
                          credit: cs.credit,
                          totalAcload: cs.totalAcload,
                          active: cs.active,
                          semesterName: cs.semesterName,  // ✔ qo‘shildi
                          test_count: item.test_count ?? 0,
                        };
                      });

                      setState((prev) => ({
                        ...prev,
                        curriculums: mapped,
                        totalSubjects: mapped.length,
                        totalPages: 1,
                        currentPage: 0,
                      }));

                    } else {
                      const filtered = originalCurriculums.filter(
                        (item) => item.subject?.id === selectedId
                      );

                      const mappedFiltered = filtered.map((item) => {
                        const cs = item.subject;
                        const subj = cs?.subject || {};
                        return {
                          id: cs.id,
                          hemisId: cs.hemisId,
                          code: subj.code,
                          name: subj.name,
                          department: cs.department,
                          credit: cs.credit,
                          totalAcload: cs.totalAcload,
                          active: cs.active,
                          semesterName: cs.semesterName,  // ✔ qo‘shildi
                          test_count: item.test_count ?? 0,
                        };
                      });

                      setState((prev) => ({
                        ...prev,
                        curriculums: mappedFiltered,
                        totalSubjects: mappedFiltered.length,
                        totalPages: 1,
                        currentPage: 0,
                      }));
                    }
                  }}

                  isSearchable
                  isClearable
                  placeholder="Fan nomini tanlang"
                />
              </div>

              {/* Buttons */}
              <div className="flex w-full items-end md:w-1/3">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                  title="Filtrlarni tozalash"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Filtrlarni tozalash
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Jami <span className="font-medium">{totalSubjects}</span> ta natija,
            sahifa <span className="font-medium">{currentPage + 1}</span> /{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>

        {/* Table Section */}
        {isLoading || isUpdating ? (
          <LoadingOverlay text="Yangilanmoqda..." />
        ) : curriculums.length > 0 ? (
          <CurriculumTableContent
            curriculums={curriculums}
            navigate={navigate}
            currentPage={currentPage}
            totalPages={totalPages}
            totalSubjects={totalSubjects}
            PAGE_SIZE={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// Table content komponenti
const CurriculumTableContent = ({
  curriculums,
  navigate,
  currentPage,
  totalPages,
  totalSubjects,
  PAGE_SIZE,
  onPageChange,
}) => (
  <div className="overflow-hidden rounded-lg shadow">
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "№",
                "Fan kodi",
                "Fan nomi",
                "Bo'lim",
                "Semester",
                "Kredit",
                "Akademik yuk",
                "Test savollar soni",
                "Amal",
                "Holati",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {curriculums.map((curriculum, index) => (
              <TableRow
                key={curriculum.id}
                curriculum={curriculum}
                navigate={navigate}
                index={currentPage * PAGE_SIZE + index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalSubjects={totalSubjects}
      PAGE_SIZE={PAGE_SIZE}
      onPageChange={onPageChange}
    />
  </div>
);

// Table row komponenti
const TableRow = ({ curriculum, navigate, index }) => (
  <tr
    className="cursor-pointer hover:bg-gray-50"
    onClick={() => navigate(`/superadmin/curriculum-subject/${curriculum.id}`)}
  >
    <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900">
      {index + 1}
    </td>
    <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900">
      {curriculum.code || "N/A"}
    </td>
    <td className="px-3 py-2 text-sm font-medium text-gray-900">
      {curriculum.name || "N/A"}
    </td>
    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
      {curriculum.department?.name || "N/A"}
    </td>
    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
      {curriculum?.semesterName || "N/A"}
    </td>

    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
      {curriculum.credit ?? "N/A"}
    </td>
    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
      {curriculum.totalAcload ?? "N/A"}
    </td>

    {/* 🔹 Количество тестов */}
    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
      {curriculum.test_count ?? 0}
    </td>

    {/* 🔹 Кнопка "Test yuklash" */}
    <td
      className="whitespace-nowrap px-3 py-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() =>
          navigate(`/superadmin/test-upload/${curriculum.id}`, {
            state: { curriculumSubjectId: curriculum.id },
          })
        }
        className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
      >
        Test yuklash
      </button>
    </td>

    {/* 🔹 Статус */}
    <td className="whitespace-nowrap px-3 py-2">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${curriculum.active
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}
      >
        {curriculum.active ? "Faol" : "Nofaol"}
      </span>
    </td>
  </tr>
);

// Pagination komponenti
const Pagination = ({
  currentPage,
  totalPages,
  totalSubjects,
  PAGE_SIZE,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else if (currentPage < 2) {
      for (let i = 0; i < maxVisible; i++) pages.push(i);
    } else if (currentPage > totalPages - 3) {
      for (let i = totalPages - maxVisible; i < totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          label="Oldingi"
        />
        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          label="Keyingi"
          className="ml-3"
        />
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Ko'rsatilmoqda{" "}
            <span className="font-medium">
              {Math.max(1, currentPage * PAGE_SIZE + 1)}
            </span>{" "}
            dan{" "}
            <span className="font-medium">
              {Math.min((currentPage + 1) * PAGE_SIZE, totalSubjects)}
            </span>{" "}
            gacha <span className="font-medium">{totalSubjects}</span> dan
          </p>
        </div>

        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <PaginationButton
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            icon="first"
          />
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            label="Oldingi"
          />

          {getPageNumbers().map((pageNum) => (
            <PaginationButton
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              label={pageNum + 1}
              active={currentPage === pageNum}
            />
          ))}

          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            label="Keyingi"
          />
          <PaginationButton
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            icon="last"
          />
        </nav>
      </div>
    </div>
  );
};

// Pagination button komponenti
const PaginationButton = ({
  onClick,
  disabled,
  label,
  active,
  icon,
  className = "",
}) => {
  const getIcon = () => {
    switch (icon) {
      case "first":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "last":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center border px-3 py-2 text-sm font-medium focus:z-20 ${active
        ? "z-10 border-blue-500 bg-blue-50 text-blue-600"
        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className} ${icon ? "px-2" : "px-4"
        } ${!label && !icon ? "w-10" : ""}`}
    >
      {icon ? (
        <>
          <span className="sr-only">
            {icon === "first" ? "Boshiga" : "Oxiriga"}
          </span>
          {getIcon()}
        </>
      ) : (
        label
      )}
    </button>
  );
};

// Empty state komponenti
const EmptyState = () => (
  <div className="rounded-lg bg-white p-12 text-center shadow">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">
      O'quv rejalar ro'yxati topilmadi!
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      Hozircha hech qanday o'quv rejasi mavjud emas. Yangilash tugmasini bosib
      sinab ko'ring.
    </p>
  </div>
);

export default CurriculumTable;
