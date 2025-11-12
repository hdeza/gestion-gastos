"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Users,
  ArrowLeft,
  Loader2,
  User,
  Crown,
  Settings,
  Trash2,
  Plus,
  QrCode,
  Share2,
  Copy,
  Calendar,
  X,
  Check,
  XCircle,
  DollarSign,
  CreditCard,
  Edit,
  Tag,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Target,
  CheckCircle,
} from "lucide-react";
import { groupService } from "../../../services/groupService";
import { invitationService } from "../../../services/invitationService";
import { incomeService } from "../../../services/incomeService";
import { expenseService } from "../../../services/expenseService";
import { categoryService } from "../../../services/categoryService";
import { goalService } from "../../../services/goalService";
import { goalContributionService } from "../../../services/goalContributionService";
import { GroupDetail, GroupMember } from "../../../types/group";
import { Invitation, InvitationQRResponse } from "../../../types/invitation";
import { Income, CreateIncomeData } from "../../../types/income";
import { Expense, CreateExpenseData } from "../../../types/expense";
import { Category } from "../../../types/category";
import { Goal, CreateGoalData } from "../../../types/goal";
import { GoalContribution, CreateGoalContributionData } from "../../../types/goalContribution";
import { useAuth } from "../../../contexts/AuthContext";
import { formatCurrency } from "../../../utils/currency";
import Swal from "sweetalert2";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<InvitationQRResponse | null>(null);
  const [invitationDays, setInvitationDays] = useState(7);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  
  // Estados para ingresos y gastos
  const [activeTab, setActiveTab] = useState<'incomes' | 'expenses' | 'goals'>('incomes');
  const [groupIncomes, setGroupIncomes] = useState<Income[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [groupTotalIncome, setGroupTotalIncome] = useState(0);
  const [groupTotalExpense, setGroupTotalExpense] = useState(0);
  
  // Estados para metas grupales
  const [groupGoals, setGroupGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
  const [showGoalContributions, setShowGoalContributions] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  
  // Formularios
  const [incomeFormData, setIncomeFormData] = useState<CreateIncomeData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    fuente: '',
    id_categoria: 0,
    id_grupo: groupId,
  });
  
  const [expenseFormData, setExpenseFormData] = useState<CreateExpenseData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    nota: '',
    recurrente: false,
    id_categoria: 0,
    id_grupo: groupId,
  });
  
  const [goalFormData, setGoalFormData] = useState<CreateGoalData>({
    nombre: '',
    monto_objetivo: 0,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'activa',
    id_grupo: groupId,
  });
  
  const [contributionFormData, setContributionFormData] = useState<CreateGoalContributionData>({
    id_meta: 0,
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (groupId) {
      loadGroupData();
      loadTransactions();
      loadCategories();
      loadGoals();
    }
  }, [groupId]);
  
  useEffect(() => {
    if (activeTab === 'goals') {
      loadGoals();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (groupId) {
      setIncomeFormData(prev => ({ ...prev, id_grupo: groupId }));
      setExpenseFormData(prev => ({ ...prev, id_grupo: groupId }));
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setIsLoading(true);
      const [groupData, invitationsData] = await Promise.all([
        groupService.getGroupById(groupId),
        invitationService.getGroupInvitations(groupId).catch(() => []),
      ]);
      setGroup(groupData);
      // El API devuelve los miembros directamente en groupData.miembros
      setMembers(groupData.miembros || []);
      setInvitations(invitationsData.filter((inv) => inv.estado === "pendiente"));
    } catch (error: any) {
      console.error("Error cargando datos del grupo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cargar los datos del grupo",
      }).then(() => {
        router.push("/main/groups");
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const [incomesData, expensesData, totalIncomeData, totalExpenseData] = await Promise.all([
        incomeService.getGroupIncomes(groupId, { limit: 100 }).catch((err) => {
          console.error("Error cargando ingresos:", err);
          return [];
        }),
        expenseService.getGroupExpenses(groupId, { limit: 100 }).catch((err) => {
          console.error("Error cargando gastos:", err);
          return [];
        }),
        incomeService.getGroupTotalIncome(groupId).catch((err) => {
          console.error("Error cargando total de ingresos:", err);
          return null;
        }),
        expenseService.getGroupTotalExpenses(groupId).catch((err) => {
          console.error("Error cargando total de gastos:", err);
          return null;
        }),
      ]);
      
      setGroupIncomes(incomesData);
      setGroupExpenses(expensesData);
      
      // Calcular totales desde los datos si los endpoints fallan
      const calculatedIncomeTotal = incomesData.reduce((sum, inc) => sum + Number(inc.monto || 0), 0);
      const calculatedExpenseTotal = expensesData.reduce((sum, exp) => sum + Number(exp.monto || 0), 0);
      
      // Usar el total del API si está disponible, sino calcular desde los datos
      setGroupTotalIncome(totalIncomeData?.total ?? calculatedIncomeTotal);
      setGroupTotalExpense(totalExpenseData?.total ?? calculatedExpenseTotal);
      
      console.log("Totales calculados:", {
        apiIncome: totalIncomeData?.total,
        calculatedIncome: calculatedIncomeTotal,
        apiExpense: totalExpenseData?.total,
        calculatedExpense: calculatedExpenseTotal,
        incomesCount: incomesData.length,
        expensesCount: expensesData.length,
      });
    } catch (error: any) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const [incomeCats, expenseCats] = await Promise.all([
        categoryService.getCategories({ tipo: 'ingreso' }),
        categoryService.getCategories({ tipo: 'gasto' }),
      ]);
      setIncomeCategories(incomeCats);
      setExpenseCategories(expenseCats);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const isAdmin = members.some(
    (m) => m.id_usuario === user?.id_usuario && m.rol === "admin"
  );
  const isCreator = (group?.id_creador === user?.id_usuario) || (group?.creado_por === user?.id_usuario);

  const handleCreateInvitation = async () => {
    try {
      setIsCreatingInvitation(true);
      const newInvitation = await invitationService.createInvitation({
        id_grupo: groupId,
        id_usuario_invitado: null,
        dias_expiracion: invitationDays,
      });

      Swal.fire({
        icon: "success",
        title: "Invitación creada",
        text: "La invitación ha sido creada exitosamente",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowInviteModal(false);
      loadGroupData();
    } catch (error: any) {
      console.error("Error creando invitación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear la invitación",
      });
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const handleGenerateQR = async (invitationId: number) => {
    try {
      setIsLoadingQR(true);
      const qrResponse = await invitationService.getInvitationQR(invitationId);
      setQrData(qrResponse);
      setShowQRModal(true);
    } catch (error: any) {
      console.error("Error generando QR:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al generar el código QR",
      });
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: "success",
      title: "Enlace copiado",
      text: "El enlace de invitación ha sido copiado al portapapeles",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleShareWhatsApp = (link: string) => {
    const message = `¡Te invito a unirte a mi grupo "${group?.nombre}"!\n\nÚnete aquí: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleRevokeInvitation = async (invitationId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Revocar invitación?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, revocar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await invitationService.revokeInvitation(invitationId);
        Swal.fire({
          icon: "success",
          title: "Invitación revocada",
          timer: 2000,
          showConfirmButton: false,
        });
        loadGroupData();
      } catch (error: any) {
        console.error("Error revocando invitación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al revocar la invitación",
        });
      }
    }
  };

  const handleRemoveMember = async (userId: number, userName: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Remover miembro?",
      text: `¿Estás seguro de remover a ${userName} del grupo?`,
      showCancelButton: true,
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await groupService.removeMember(groupId, userId);
        Swal.fire({
          icon: "success",
          title: "Miembro removido",
          timer: 2000,
          showConfirmButton: false,
        });
        loadGroupData();
      } catch (error: any) {
        console.error("Error removiendo miembro:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al remover el miembro",
        });
      }
    }
  };

  const handleChangeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "miembro" : "admin";
    try {
      await groupService.changeMemberRole(groupId, userId, newRole);
      Swal.fire({
        icon: "success",
        title: "Rol actualizado",
        timer: 2000,
        showConfirmButton: false,
      });
      loadGroupData();
    } catch (error: any) {
      console.error("Error cambiando rol:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cambiar el rol",
      });
    }
  };
  
  const handleCreateGroupIncome = async () => {
    if (!incomeFormData.descripcion.trim() || !incomeFormData.fuente.trim() || incomeFormData.monto <= 0 || !incomeFormData.id_categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Todos los campos son obligatorios",
      });
      return;
    }
    
    try {
      setIsSubmittingTransaction(true);
      const newIncome = await incomeService.createIncome({
        ...incomeFormData,
        id_grupo: groupId,
      });
      setGroupIncomes(prev => [newIncome, ...prev]);
      // Recalcular total de ingresos
      setGroupTotalIncome(prev => prev + Number(newIncome.monto || 0));
      setIncomeFormData({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        fuente: '',
        id_categoria: incomeCategories.length > 0 ? incomeCategories[0].id_categoria : 0,
        id_grupo: groupId,
      });
      setShowIncomeForm(false);
      Swal.fire({
        icon: "success",
        title: "Ingreso creado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error creando ingreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el ingreso",
      });
    } finally {
      setIsSubmittingTransaction(false);
    }
  };
  
  const handleCreateGroupExpense = async () => {
    if (!expenseFormData.descripcion.trim() || expenseFormData.monto <= 0 || !expenseFormData.id_categoria) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Todos los campos obligatorios deben estar completos",
      });
      return;
    }
    
    try {
      setIsSubmittingTransaction(true);
      const newExpense = await expenseService.createExpense({
        ...expenseFormData,
        id_grupo: groupId,
      });
      setGroupExpenses(prev => [newExpense, ...prev]);
      // Recalcular total de gastos
      setGroupTotalExpense(prev => prev + Number(newExpense.monto || 0));
      setExpenseFormData({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        nota: '',
        recurrente: false,
        id_categoria: expenseCategories.length > 0 ? expenseCategories[0].id_categoria : 0,
        id_grupo: groupId,
      });
      setShowExpenseForm(false);
      Swal.fire({
        icon: "success",
        title: "Gasto creado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error creando gasto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el gasto",
      });
    } finally {
      setIsSubmittingTransaction(false);
    }
  };
  
  const handleDeleteGroupIncome = async (incomeId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar ingreso?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    
    if (result.isConfirmed) {
      try {
        // Obtener el ingreso antes de eliminarlo para restar su monto
        const incomeToDelete = groupIncomes.find(inc => inc.id_ingreso === incomeId);
        await incomeService.deleteIncome(incomeId);
        setGroupIncomes(prev => prev.filter(inc => inc.id_ingreso !== incomeId));
        // Recalcular total de ingresos
        if (incomeToDelete) {
          setGroupTotalIncome(prev => prev - Number(incomeToDelete.monto || 0));
        }
        Swal.fire({
          icon: "success",
          title: "Ingreso eliminado",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Error eliminando ingreso:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar el ingreso",
        });
      }
    }
  };
  
  const handleDeleteGroupExpense = async (expenseId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar gasto?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    
    if (result.isConfirmed) {
      try {
        // Obtener el gasto antes de eliminarlo para restar su monto
        const expenseToDelete = groupExpenses.find(exp => exp.id_gasto === expenseId);
        await expenseService.deleteExpense(expenseId);
        setGroupExpenses(prev => prev.filter(exp => exp.id_gasto !== expenseId));
        // Recalcular total de gastos
        if (expenseToDelete) {
          setGroupTotalExpense(prev => prev - Number(expenseToDelete.monto || 0));
        }
        Swal.fire({
          icon: "success",
          title: "Gasto eliminado",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Error eliminando gasto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar el gasto",
        });
      }
    }
  };

  const loadGoals = async () => {
    try {
      setIsLoadingGoals(true);
      const goalsData = await goalService.getGroupGoals(groupId, { limit: 100 });
      
      // Los datos ya vienen con monto_acumulado y porcentaje_completado del API
      // Si no viene porcentaje_completado, lo calculamos manualmente
      const goalsWithProgress = goalsData.map(goal => {
        if (goal.porcentaje_completado === undefined || goal.porcentaje_completado === null) {
          const montoObjetivo = Number(goal.monto_objetivo);
          const montoAcumulado = Number(goal.monto_acumulado || 0);
          const porcentaje = montoObjetivo > 0 ? (montoAcumulado / montoObjetivo) * 100 : 0;
          return {
            ...goal,
            porcentaje_completado: porcentaje,
          };
        }
        return goal;
      });
      
      console.log('Metas del grupo cargadas:', goalsWithProgress);
      setGroupGoals(goalsWithProgress);
    } catch (error: any) {
      console.error("Error cargando metas:", error);
    } finally {
      setIsLoadingGoals(false);
    }
  };
  
  const loadGoalContributions = async (goalId: number) => {
    try {
      const contributionsData = await goalContributionService.getContributionsByGoal(goalId, { limit: 100 });
      setGoalContributions(contributionsData);
    } catch (error: any) {
      console.error("Error cargando aportes:", error);
    }
  };
  
  const handleCreateGroupGoal = async () => {
    if (!goalFormData.nombre.trim() || goalFormData.monto_objetivo <= 0 || !goalFormData.fecha_inicio || !goalFormData.fecha_fin) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Todos los campos son obligatorios",
      });
      return;
    }
    
    try {
      setIsSubmittingTransaction(true);
      const newGoal = await goalService.createGoal({
        ...goalFormData,
        id_grupo: groupId,
      });
      await loadGoals();
      setGoalFormData({
        nombre: '',
        monto_objetivo: 0,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: 'activa',
        id_grupo: groupId,
      });
      setShowGoalForm(false);
      Swal.fire({
        icon: "success",
        title: "Meta creada",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error creando meta:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear la meta",
      });
    } finally {
      setIsSubmittingTransaction(false);
    }
  };
  
  const handleDeleteGroupGoal = async (goalId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar meta?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    
    if (result.isConfirmed) {
      try {
        await goalService.deleteGoal(goalId);
        await loadGoals();
        Swal.fire({
          icon: "success",
          title: "Meta eliminada",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Error eliminando meta:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar la meta",
        });
      }
    }
  };
  
  const handleCreateGoalContribution = async () => {
    if (!contributionFormData.id_meta || contributionFormData.monto <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: "El monto debe ser mayor a 0",
      });
      return;
    }
    
    try {
      setIsSubmittingTransaction(true);
      await goalContributionService.createContribution(contributionFormData);
      await loadGoalContributions(contributionFormData.id_meta);
      await loadGoals();
      
      // Actualizar el progreso de la meta seleccionada si está abierta
      if (selectedGoal && selectedGoal.id_meta === contributionFormData.id_meta) {
        try {
          // Recargar la meta completa para obtener todos los datos actualizados
          const updatedGoal = await goalService.getGoalById(selectedGoal.id_meta);
          setSelectedGoal(updatedGoal);
        } catch (error) {
          console.error("Error actualizando progreso:", error);
        }
      }
      
      setContributionFormData({
        id_meta: contributionFormData.id_meta,
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
      });
      setShowContributionForm(false);
      Swal.fire({
        icon: "success",
        title: "Aporte creado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error creando aporte:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al crear el aporte",
      });
    } finally {
      setIsSubmittingTransaction(false);
    }
  };
  
  const handleDeleteGoalContribution = async (contributionId: number, goalId: number) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar aporte?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    
    if (result.isConfirmed) {
      try {
        await goalContributionService.deleteContribution(contributionId);
        await loadGoalContributions(goalId);
        await loadGoals();
        
        // Actualizar el progreso de la meta seleccionada si está abierta
        if (selectedGoal && selectedGoal.id_meta === goalId) {
          try {
            // Recargar la meta completa para obtener todos los datos actualizados
            const updatedGoal = await goalService.getGoalById(selectedGoal.id_meta);
            setSelectedGoal(updatedGoal);
          } catch (error) {
            console.error("Error actualizando progreso:", error);
          }
        }
        
        Swal.fire({
          icon: "success",
          title: "Aporte eliminado",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        console.error("Error eliminando aporte:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al eliminar el aporte",
        });
      }
    }
  };
  
  const openGoalDetails = async (goal: Goal) => {
    // Recargar la meta para obtener los datos más actualizados con progreso
    try {
      const updatedGoal = await goalService.getGoalById(goal.id_meta);
      setSelectedGoal(updatedGoal);
    } catch (error) {
      // Si falla, usar la meta que ya tenemos
      setSelectedGoal(goal);
    }
    setShowGoalContributions(true);
    await loadGoalContributions(goal.id_meta);
  };
  
  const openContributionForm = (goal: Goal) => {
    if (goal.estado !== 'activa') {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Solo se pueden hacer aportes a metas activas",
      });
      return;
    }
    setContributionFormData({
      id_meta: goal.id_meta,
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
    });
    setShowContributionForm(true);
  };
  
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'completada':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-neutral-600" />;
    }
  };
  
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-blue-100 text-blue-700';
      case 'completada':
        return 'bg-green-100 text-green-700';
      case 'cancelada':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando grupo...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const balance = groupTotalIncome - groupTotalExpense;

  return (
    <div className="space-y-6">
      {/* Header con iconos estilo WhatsApp */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/main/groups")}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-600" />
            {group.nombre}
          </h1>
          {group.descripcion && (
            <p className="text-neutral-500 text-sm mt-1">{group.descripcion}</p>
          )}
        </div>
        {/* Iconos estilo WhatsApp */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-lg transition-colors ${
              showMembers 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Ver miembros"
          >
            <Users className="h-5 w-5" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowInvitations(!showInvitations)}
                className={`p-2 rounded-lg transition-colors ${
                  showInvitations 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title="Ver invitaciones"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                title="Crear invitación"
              >
                <Plus className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Balance Section - Contenido Principal */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Balance del Grupo
        </h2>
        
        {/* Resumen de Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-600 mb-1">Total Ingresos</div>
            <div className="text-2xl font-bold text-emerald-900">
              {formatCurrency(groupTotalIncome, user)}
            </div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="text-sm text-red-600 mb-1">Total Gastos</div>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(groupTotalExpense, user)}
            </div>
          </div>
          <div className={`rounded-xl border p-4 ${
            balance >= 0 
              ? 'border-emerald-100 bg-emerald-50' 
              : 'border-red-100 bg-red-50'
          }`}>
            <div className={`text-sm mb-1 ${
              balance >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              Balance
            </div>
            <div className={`text-2xl font-bold ${
              balance >= 0 ? 'text-emerald-900' : 'text-red-900'
            }`}>
              {formatCurrency(balance, user)}
            </div>
          </div>
        </div>

        {/* Mensaje cuando no hay transacciones */}
        {groupTotalIncome === 0 && groupTotalExpense === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
            <p>No hay transacciones aún. Agrega ingresos o gastos para ver el balance.</p>
          </div>
        )}
      </div>

      {/* Members Section - Colapsable */}
      {showMembers && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Miembros ({group.total_miembros ?? members.length})
            </h2>
            <button
              onClick={() => setShowMembers(false)}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No hay miembros en este grupo
            </div>
          ) : (
            members.map((member) => {
              const isMemberAdmin = member.rol === "admin";
              const isCurrentUser = member.id_usuario === user?.id_usuario;
              const canRemove = isAdmin && !isCurrentUser;
              const canChangeRole = isAdmin && !isCurrentUser && isCreator;
              
              // Usar nombre directo del API o del objeto usuario
              const memberName = member.nombre || member.usuario?.nombre || "Usuario";
              const memberEmail = member.correo || member.usuario?.correo || "";

              return (
                <div
                  key={member.id_usuario}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-900">
                          {memberName}
                        </span>
                        {isMemberAdmin && (
                          <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" title="Administrador" />
                        )}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-600 mb-1">
                        {memberEmail}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Se unió: {formatDate(member.fecha_union)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canChangeRole && (
                      <button
                        onClick={() => handleChangeRole(member.id_usuario, member.rol)}
                        className="p-2 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                        title={`Cambiar a ${member.rol === "admin" ? "miembro" : "admin"}`}
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                    {canRemove && (
                      <button
                        onClick={() =>
                          handleRemoveMember(
                            member.id_usuario,
                            memberName
                          )
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover miembro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      )}

      {/* Invitations Section - Colapsable */}
      {showInvitations && isAdmin && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-blue-600" />
              Invitaciones Activas ({invitations.length})
            </h2>
            <button
              onClick={() => setShowInvitations(false)}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No hay invitaciones activas. Crea una para compartir el grupo.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id_invitacion}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-900">
                        Invitación #{invitation.id_invitacion}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {invitation.estado}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500">
                      Expira: {formatDate(invitation.fecha_expiracion)}
                    </div>
                    {invitation.link_invitacion && (
                      <div className="text-xs text-neutral-400 mt-1 font-mono truncate max-w-md">
                        {invitation.link_invitacion}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateQR(invitation.id_invitacion)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Generar QR"
                      disabled={isLoadingQR}
                    >
                      {isLoadingQR ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4" />
                      )}
                    </button>
                    {invitation.link_invitacion && (
                      <>
                        <button
                          onClick={() => handleCopyLink(invitation.link_invitacion!)}
                          className="p-2 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                          title="Copiar enlace"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(invitation.link_invitacion!)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Compartir por WhatsApp"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRevokeInvitation(invitation.id_invitacion)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Revocar invitación"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">
                Crear Invitación
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Días de expiración
                </label>
                <input
                  type="number"
                  value={invitationDays}
                  onChange={(e) => setInvitationDays(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  La invitación expirará en {invitationDays} día(s)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                disabled={isCreatingInvitation}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInvitation}
                disabled={isCreatingInvitation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingInvitation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Invitación"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Section - Ingresos y Gastos */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            {activeTab === 'incomes' ? (
              <DollarSign className="h-6 w-6 text-emerald-600" />
            ) : activeTab === 'expenses' ? (
              <CreditCard className="h-6 w-6 text-red-600" />
            ) : (
              <Target className="h-6 w-6 text-blue-600" />
            )}
            {activeTab === 'incomes' ? 'Ingresos del Grupo' : activeTab === 'expenses' ? 'Gastos del Grupo' : 'Metas del Grupo'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('incomes');
                setShowIncomeForm(false);
                setShowExpenseForm(false);
                setShowGoalForm(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'incomes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => {
                setActiveTab('expenses');
                setShowIncomeForm(false);
                setShowExpenseForm(false);
                setShowGoalForm(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => {
                setActiveTab('goals');
                setShowIncomeForm(false);
                setShowExpenseForm(false);
                setShowGoalForm(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'goals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Metas
            </button>
            {activeTab === 'incomes' ? (
              <button
                onClick={() => setShowIncomeForm(!showIncomeForm)}
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Ingreso
              </button>
            ) : activeTab === 'expenses' ? (
              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Gasto
              </button>
            ) : (
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva Meta
              </button>
            )}
          </div>
        </div>

        {/* Formulario de Ingreso */}
        {showIncomeForm && activeTab === 'incomes' && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-medium text-emerald-900 mb-4">Nuevo Ingreso del Grupo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={incomeFormData.descripcion}
                  onChange={(e) => setIncomeFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej. Contribución mensual"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fuente *</label>
                <input
                  type="text"
                  value={incomeFormData.fuente}
                  onChange={(e) => setIncomeFormData(prev => ({ ...prev, fuente: e.target.value }))}
                  placeholder="Ej. Miembro del grupo"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto *</label>
                <input
                  type="number"
                  value={incomeFormData.monto || ''}
                  onChange={(e) => setIncomeFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={incomeFormData.fecha}
                  onChange={(e) => setIncomeFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                <select
                  value={incomeFormData.id_categoria}
                  onChange={(e) => setIncomeFormData(prev => ({ ...prev, id_categoria: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {incomeCategories.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateGroupIncome}
                disabled={isSubmittingTransaction || !incomeFormData.descripcion.trim() || !incomeFormData.fuente.trim() || incomeFormData.monto <= 0 || !incomeFormData.id_categoria}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Ingreso'
                )}
              </button>
              <button
                onClick={() => {
                  setShowIncomeForm(false);
                  setIncomeFormData({
                    descripcion: '',
                    monto: 0,
                    fecha: new Date().toISOString().split('T')[0],
                    fuente: '',
                    id_categoria: incomeCategories.length > 0 ? incomeCategories[0].id_categoria : 0,
                    id_grupo: groupId,
                  });
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario de Gasto */}
        {showExpenseForm && activeTab === 'expenses' && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-900 mb-4">Nuevo Gasto del Grupo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={expenseFormData.descripcion}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej. Almuerzo grupal"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto *</label>
                <input
                  type="number"
                  value={expenseFormData.monto || ''}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={expenseFormData.fecha}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Método de Pago *</label>
                <select
                  value={expenseFormData.metodo_pago}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                <select
                  value={expenseFormData.id_categoria}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, id_categoria: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nota (opcional)</label>
                <textarea
                  value={expenseFormData.nota}
                  onChange={(e) => setExpenseFormData(prev => ({ ...prev, nota: e.target.value }))}
                  placeholder="Notas adicionales..."
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expenseFormData.recurrente}
                    onChange={(e) => setExpenseFormData(prev => ({ ...prev, recurrente: e.target.checked }))}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700">Gasto recurrente</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateGroupExpense}
                disabled={isSubmittingTransaction || !expenseFormData.descripcion.trim() || expenseFormData.monto <= 0 || !expenseFormData.id_categoria}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Gasto'
                )}
              </button>
              <button
                onClick={() => {
                  setShowExpenseForm(false);
                  setExpenseFormData({
                    descripcion: '',
                    monto: 0,
                    fecha: new Date().toISOString().split('T')[0],
                    metodo_pago: 'efectivo',
                    nota: '',
                    recurrente: false,
                    id_categoria: expenseCategories.length > 0 ? expenseCategories[0].id_categoria : 0,
                    id_grupo: groupId,
                  });
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Transacciones */}
        {isLoadingTransactions ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-neutral-500">Cargando transacciones...</p>
          </div>
        ) : activeTab === 'incomes' ? (
          <div className="space-y-3">
            {groupIncomes.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <DollarSign className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>No hay ingresos registrados en este grupo</p>
              </div>
            ) : (
              groupIncomes.map((income) => {
                const category = incomeCategories.find(cat => cat.id_categoria === income.id_categoria);
                return (
                  <div
                    key={income.id_ingreso}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category?.color || '#10b981'}20` }}
                      >
                        {category?.icono || '💰'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900">{income.descripcion}</div>
                        <div className="text-sm text-neutral-500">
                          {income.fuente} • {category?.nombre || 'Sin categoría'} • {formatDate(income.fecha)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-700">
                          +{formatCurrency(Number(income.monto), user)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGroupIncome(income.id_ingreso)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar ingreso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {groupExpenses.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <CreditCard className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>No hay gastos registrados en este grupo</p>
              </div>
            ) : (
              groupExpenses.map((expense) => {
                const category = expenseCategories.find(cat => cat.id_categoria === expense.id_categoria);
                return (
                  <div
                    key={expense.id_gasto}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category?.color || '#ef4444'}20` }}
                      >
                        {category?.icono || '💸'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900">{expense.descripcion}</div>
                        <div className="text-sm text-neutral-500">
                          {category?.nombre || 'Sin categoría'} • {expense.metodo_pago} • {formatDate(expense.fecha)}
                          {expense.recurrente && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recurrente</span>}
                        </div>
                        {expense.nota && (
                          <div className="text-xs text-neutral-400 mt-1">{expense.nota}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-700">
                          -{formatCurrency(Number(expense.monto), user)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGroupExpense(expense.id_gasto)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Formulario de Meta */}
        {showGoalForm && activeTab === 'goals' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-4">Nueva Meta del Grupo</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={goalFormData.nombre}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. Ahorrar para viaje grupal"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto Objetivo *</label>
                <input
                  type="number"
                  value={goalFormData.monto_objetivo || ''}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, monto_objetivo: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Estado *</label>
                <select
                  value={goalFormData.estado}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activa">Activa</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  value={goalFormData.fecha_inicio}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha Fin *</label>
                <input
                  type="date"
                  value={goalFormData.fecha_fin}
                  onChange={(e) => setGoalFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateGroupGoal}
                disabled={isSubmittingTransaction || !goalFormData.nombre.trim() || goalFormData.monto_objetivo <= 0 || !goalFormData.fecha_inicio || !goalFormData.fecha_fin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Meta'
                )}
              </button>
              <button
                onClick={() => {
                  setShowGoalForm(false);
                  setGoalFormData({
                    nombre: '',
                    monto_objetivo: 0,
                    fecha_inicio: new Date().toISOString().split('T')[0],
                    fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    estado: 'activa',
                    id_grupo: groupId,
                  });
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Metas */}
        {activeTab === 'goals' && (
          <div className="space-y-3">
            {isLoadingGoals ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-neutral-500">Cargando metas...</p>
              </div>
            ) : groupGoals.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                <p>No hay metas registradas en este grupo</p>
              </div>
            ) : (
              groupGoals.map((goal) => {
                const montoAcumulado = Number(goal.monto_acumulado || 0);
                const montoObjetivo = Number(goal.monto_objetivo);
                // Usar porcentaje del API o calcularlo si no viene
                const porcentaje = goal.porcentaje_completado ?? (montoObjetivo > 0 ? (montoAcumulado / montoObjetivo) * 100 : 0);
                const montoFaltante = montoObjetivo - montoAcumulado;

                return (
                  <div
                    key={goal.id_meta}
                    className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    onClick={() => openGoalDetails(goal)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(goal.estado)}
                          <h3 className="font-semibold text-neutral-900">{goal.nombre}</h3>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.estado)}`}>
                            {goal.estado.charAt(0).toUpperCase() + goal.estado.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-500 mb-2">
                          {formatDate(goal.fecha_inicio)} - {formatDate(goal.fecha_fin)}
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-neutral-600">
                            {formatCurrency(montoAcumulado, user)} / {formatCurrency(montoObjetivo, user)}
                          </span>
                          <span className="font-semibold">{porcentaje.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              porcentaje >= 100 ? 'bg-green-500' : porcentaje >= 75 ? 'bg-blue-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          />
                        </div>
                        {montoFaltante > 0 && goal.estado === 'activa' && (
                          <div className="mt-2 text-xs text-neutral-500">
                            Faltante: {formatCurrency(montoFaltante, user)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {goal.estado === 'activa' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openContributionForm(goal);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Agregar aporte"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroupGoal(goal.id_meta);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar meta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Goal Details Modal */}
      {showGoalContributions && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] flex flex-col">
            {/* Header fijo */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">{selectedGoal.nombre}</h2>
              <button
                onClick={() => {
                  setShowGoalContributions(false);
                  setSelectedGoal(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Progress Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Progreso</span>
                  <span className="text-lg font-bold text-blue-900">
                    {selectedGoal.porcentaje_completado?.toFixed(1) ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all ${
                      (selectedGoal.porcentaje_completado ?? 0) >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(selectedGoal.porcentaje_completado ?? 0, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600">Objetivo</div>
                    <div className="font-semibold">{formatCurrency(Number(selectedGoal.monto_objetivo), user)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Actual</div>
                    <div className="font-semibold">{formatCurrency(Number(selectedGoal.monto_acumulado || 0), user)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Faltante</div>
                    <div className="font-semibold">
                      {formatCurrency(Number(selectedGoal.monto_objetivo) - Number(selectedGoal.monto_acumulado || 0), user)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributions List con scroll interno */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Aportes</h3>
                  {selectedGoal.estado === 'activa' && (
                    <button
                      onClick={() => openContributionForm(selectedGoal)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo Aporte
                    </button>
                  )}
                </div>
                {goalContributions.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No hay aportes aún
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                    {goalContributions.map((contribution) => (
                      <div
                        key={contribution.id_aporte}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-neutral-900">
                            {formatCurrency(Number(contribution.monto), user)}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {contribution.usuario?.nombre || 'Usuario'} • {formatDate(contribution.fecha)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGoalContribution(contribution.id_aporte, selectedGoal.id_meta)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Form Modal */}
      {showContributionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Nuevo Aporte</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={contributionFormData.monto || ''}
                  onChange={(e) => setContributionFormData({ ...contributionFormData, monto: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={contributionFormData.fecha}
                  onChange={(e) => setContributionFormData({ ...contributionFormData, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowContributionForm(false);
                  setContributionFormData({
                    id_meta: 0,
                    monto: 0,
                    fecha: new Date().toISOString().split('T')[0],
                  });
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                disabled={isSubmittingTransaction}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGoalContribution}
                disabled={isSubmittingTransaction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Aporte'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">
                Código QR de Invitación
              </h2>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQrData(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${qrData.qr_code_base64}`}
                  alt="QR Code"
                  className="w-64 h-64 border border-neutral-200 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Enlace de invitación
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrData.link_invitacion}
                      readOnly
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => handleCopyLink(qrData.link_invitacion)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleShareWhatsApp(qrData.link_invitacion)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Compartir por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

