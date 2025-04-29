import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { languageContext } from "../contexts/LanguageProvider";

export default function Products() {
  const { isArabic } = useContext(languageContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: "",
    inventory: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://192.168.8.10:5000/products");
      setProducts(res.data);
    } catch (err) {
      toast.error(isArabic ? "فشل في جلب المنتجات" : "Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetProductState = () => {
    setCurrentProduct({ name: "", price: "", inventory: 0 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isArabic ? "هل أنت متأكد من حذف المنتج؟" : "Are you sure you want to delete this product?")) return;

    setActionLoading(true);
    try {
      await axios.delete(`http://192.168.8.10:5000/products/${id}`);
      toast.success(isArabic ? "تم حذف المنتج بنجاح!" : "Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      toast.error(isArabic ? "فشل في حذف المنتج" : "Failed to delete product");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct({ ...product });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: name === "inventory" ? parseInt(value) : value,
    }));
  };

  const validateProduct = () => {
    const { name, price, inventory } = currentProduct;
    return name.trim() !== "" && parseFloat(price) >= 0 && inventory >= 0;
  };

  const handleUpdateProduct = async () => {
    if (!validateProduct()) {
      toast.error(isArabic ? "يرجى تعبئة جميع الحقول بشكل صحيح" : "Please fill all fields correctly");
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`http://192.168.8.10:5000/products/${currentProduct._id}`, {
        name: currentProduct.name.trim(),
        price: parseFloat(currentProduct.price),
        inventory: currentProduct.inventory,
      });
      toast.success(isArabic ? "تم تحديث المنتج بنجاح!" : "Product updated successfully!");
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(isArabic ? "فشل في تحديث المنتج" : "Failed to update product");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!validateProduct()) {
      toast.error(isArabic ? "يرجى تعبئة جميع الحقول بشكل صحيح" : "Please fill all fields correctly");
      return;
    }

    setActionLoading(true);
    try {
      await axios.post("http://192.168.8.10:5000/products", {
        name: currentProduct.name.trim(),
        price: parseFloat(currentProduct.price),
        inventory: currentProduct.inventory,
      });
      toast.success(isArabic ? "تمت إضافة المنتج بنجاح!" : "Product added successfully!");
      setShowAddModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(isArabic ? "فشل في إضافة المنتج" : "Failed to add product");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const ProductForm = ({ onSave, onCancel }) => (
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {isArabic ? (showEditModal ? "تعديل المنتج" : "إضافة منتج") : (showEditModal ? "Edit Product" : "Add Product")}
      </h2>
      <input
        type="text"
        name="name"
        value={currentProduct.name}
        onChange={handleChange}
        placeholder={isArabic ? "اسم المنتج" : "Product Name"}
        className="input input-bordered w-full mb-4"
      />
      <input
        type="number"
        name="price"
        value={currentProduct.price}
        onChange={handleChange}
        placeholder={isArabic ? "سعر المنتج" : "Product Price"}
        className="input input-bordered w-full mb-4"
      />
      <input
        type="number"
        name="inventory"
        value={currentProduct.inventory}
        onChange={handleChange}
        placeholder={isArabic ? "المخزون" : "Inventory"}
        className="input input-bordered w-full mb-4"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn btn-secondary" disabled={actionLoading}>
          {isArabic ? "إلغاء" : "Cancel"}
        </button>
        <button onClick={onSave} className="btn btn-primary" disabled={actionLoading}>
          {actionLoading
            ? isArabic
              ? (showEditModal ? "جارٍ التحديث..." : "جارٍ الإضافة...")
              : (showEditModal ? "Updating..." : "Adding...")
            : isArabic
              ? (showEditModal ? "تحديث" : "إضافة")
              : (showEditModal ? "Update" : "Add")}
        </button>
      </div>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-600">
          {isArabic ? "المنتجات" : "Products"}
        </h1>
        <button
          onClick={() => {
            resetProductState();
            setShowAddModal(true);
          }}
          className="btn btn-primary"
          aria-label={isArabic ? "إضافة منتج جديد" : "Add new product"}
        >
          <FaPlus className="mr-2" /> {isArabic ? "إضافة منتج" : "Add Product"}
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="table w-full text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">{isArabic ? "الاسم" : "Name"}</th>
              <th className="p-2">{isArabic ? "السعر (ر.س)" : "Price (SAR)"}</th>
              <th className="p-2">{isArabic ? "المخزون" : "Inventory"}</th>
              <th className="p-2">{isArabic ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{parseFloat(p.price).toFixed(2)}</td>
                <td className="p-2">{p.inventory}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="btn btn-sm btn-warning" disabled={actionLoading}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-error" disabled={actionLoading}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <ProductForm
            onSave={showEditModal ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              showEditModal ? setShowEditModal(false) : setShowAddModal(false);
              resetProductState();
            }}
          />
        </div>
      )}
    </div>
  );
}
