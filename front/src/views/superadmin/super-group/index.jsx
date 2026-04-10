import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import Select from "react-select";
import Breadcrumbs from "views/BackLink/BackButton";

const SuperGroup = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [superGroups, setSuperGroups] = useState([]);
  const [mainGroup, setMainGroup] = useState(null);
  const [subGroups, setSubGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH DATA ================= */

  const getGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      const options = res.data.map((g) => ({
        value: g.id,
        label: g.name,
      }));
      setGroups(options);
    } catch (error) {
      navigate("/admin/login");
    }
  };

  const getSuperGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/super-group", "GET");
      setSuperGroups(res.data);
      setLoading(false);
    } catch (error) {
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    getGroups();
    getSuperGroups();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async () => {
    if (!mainGroup) return alert("Select main group");

    try {
      await ApiCall("/api/v1/super-group", "POST", {
        mainGroupId: mainGroup.value,
        subGroupIds: subGroups.map((g) => g.value),
      });

      setShowModal(false);
      setMainGroup(null);
      setSubGroups([]);
      getSuperGroups();
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this SuperGroup?")) return;

    try {
      await ApiCall(`/api/v1/super-group/${id}`, "DELETE");
      getSuperGroups();
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Super Groups</h2>
        <button
          onClick={() => setShowModal(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          + Add Super Group
        </button>
      </div>

      {/* ================= TABLE ================= */}

      <div className="rounded bg-white p-4 shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>Main Group</th>
                <th>Sub Groups</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {superGroups.map((sg) => (
                <tr key={sg.id} className="border-b">
                  <td>{sg.mainGroup?.name}</td>
                  <td>{sg.subGroups?.map((s) => s.name).join(", ")}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(sg.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}

      {showModal && (
        <div className="bg-black fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className="w-[500px] rounded bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">Create Super Group</h3>

            {/* MAIN GROUP SELECT */}
            <div className="mb-4">
              <label className="mb-1 block">Main Group</label>
              <Select
                options={groups}
                value={mainGroup}
                onChange={setMainGroup}
                isSearchable
              />
            </div>

            {/* SUB GROUP MULTI SELECT */}
            <div className="mb-4">
              <label className="mb-1 block">Sub Groups</label>
              <Select
                options={groups}
                value={subGroups}
                onChange={setSubGroups}
                isMulti
                isSearchable
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperGroup;
