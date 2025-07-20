<script setup>
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { classificationApi, classificationQueryKeys } from '@/api/classifications.js';
import { useToast } from 'vue-toastification';

const queryClient = useQueryClient();
const toast = useToast();

// Modals state
const showCreateModal = ref(false);
const showRenameModal = ref(false);
const showDeleteModal = ref(false);
const showAddParameterModal = ref(false);
const showDeleteParameterModal = ref(false);

// Form data
const newClassificationName = ref('');
const renameClassificationData = ref({ id: null, name: '' });
const deleteClassificationId = ref(null);
const newParameterData = ref({ classification_id: null, name: '' });
const deleteParameterData = ref({ id: null, name: '', classification_name: '' });

// Get all classifications
const { data: classifications, isLoading, error } = useQuery({
  queryKey: classificationQueryKeys.lists(),
  queryFn: classificationApi.getAllClassifications,
  placeholderData: () => [],
});

// Create classification mutation
const { mutateAsync: createClassification, isPending: isCreating } = useMutation({
  mutationFn: classificationApi.createClassification,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Classification "${data.data.name}" created successfully!`);
  }
});

// Rename classification mutation
const { mutateAsync: renameClassification, isPending: isRenaming } = useMutation({
  mutationFn: ({ id, name }) => classificationApi.renameClassification(id, name),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Classification renamed to "${data.data.name}" successfully!`);
  }
});

// Delete classification mutation
const { mutateAsync: deleteClassification, isPending: isDeleting } = useMutation({
  mutationFn: classificationApi.deleteClassification,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success('Classification deleted successfully!');
  }
});

// Add parameter mutation
const { mutateAsync: addParameter, isPending: isAddingParameter } = useMutation({
  mutationFn: classificationApi.createClassificationParameter,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success(`Parameter "${data.data.name}" added successfully!`);
  }
});

// Delete parameter mutation
const { mutateAsync: deleteParameter, isPending: isDeletingParameter } = useMutation({
  mutationFn: classificationApi.deleteClassificationParameter,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: classificationQueryKeys.all });
    toast.success('Parameter deleted successfully!');
  }
});

// Modal handlers
const openCreateModal = () => {
  newClassificationName.value = '';
  showCreateModal.value = true;
};

const openRenameModal = (classification) => {
  renameClassificationData.value = { id: classification.id, name: classification.name };
  showRenameModal.value = true;
};

const openDeleteModal = (classification) => {
  deleteClassificationId.value = classification.id;
  showDeleteModal.value = true;
};

const openAddParameterModal = (classification) => {
  newParameterData.value = { classification_id: classification.id, name: '' };
  showAddParameterModal.value = true;
};

const openDeleteParameterModal = (parameter, classification) => {
  deleteParameterData.value = {
    id: parameter.id,
    name: parameter.name,
    classification_name: classification.name
  };
  showDeleteParameterModal.value = true;
};

// Form submissions
const handleCreateClassification = async () => {
  if (!newClassificationName.value.trim()) {
    toast.error('Classification name is required');
    return;
  }
  
  try {
    await createClassification({ name: newClassificationName.value.trim() });
    showCreateModal.value = false;
    newClassificationName.value = '';
  } catch (error) {
    toast.error(`Error creating classification: ${error.message}`);
  }
};

const handleRenameClassification = async () => {
  if (!renameClassificationData.value.name.trim()) {
    toast.error('Classification name is required');
    return;
  }
  
  try {
    await renameClassification({
      id: renameClassificationData.value.id,
      name: renameClassificationData.value.name.trim()
    });
    showRenameModal.value = false;
  } catch (error) {
    toast.error(`Error renaming classification: ${error.message}`);
  }
};

const handleDeleteClassification = async () => {
  try {
    await deleteClassification(deleteClassificationId.value);
    showDeleteModal.value = false;
  } catch (error) {
    toast.error(`Error deleting classification: ${error.message}`);
  }
};

const handleAddParameter = async () => {
  if (!newParameterData.value.name.trim()) {
    toast.error('Parameter name is required');
    return;
  }
  
  try {
    await addParameter({
      classification_id: newParameterData.value.classification_id,
      name: newParameterData.value.name.trim()
    });
    showAddParameterModal.value = false;
    newParameterData.value = { classification_id: null, name: '' };
  } catch (error) {
    toast.error(`Error adding parameter: ${error.message}`);
  }
};

const handleDeleteParameter = async () => {
  try {
    await deleteParameter(deleteParameterData.value.id);
    showDeleteParameterModal.value = false;
  } catch (error) {
    toast.error(`Error deleting parameter: ${error.message}`);
  }
};

const selectedClassification = computed(() => {
  return classifications.value?.find(c => c.id === newParameterData.value.classification_id);
});

const selectedDeleteClassification = computed(() => {
  return classifications.value?.find(c => c.id === deleteClassificationId.value);
});
</script>

<template>
  <div class="classifications-page">
    <div class="page-header">
      <h1>Classifications</h1>
      <button class="action-button primary" @click="openCreateModal">
        Create Classification
      </button>
    </div>

    <div v-if="isLoading" class="loading">Loading classifications...</div>
    <div v-else-if="error" class="error">Error loading classifications: {{ error.message }}</div>
    
    <div v-else class="classifications-list">
      <div v-if="!classifications?.length" class="empty-state">
        No classifications found. Create your first classification!
      </div>

      <div v-for="classification in classifications" :key="classification.id" class="classification-card">
        <div class="classification-header">
          <h3>{{ classification.name }}</h3>
          <div class="classification-actions">
            <router-link :to="`/classifications/${classification.id}`" class="action-button">
              View Details
            </router-link>
            <button class="action-button secondary" @click="openRenameModal(classification)">
              Rename
            </button>
            <button class="action-button secondary" @click="openAddParameterModal(classification)">
              Add Parameter
            </button>
            <button class="action-button danger" @click="openDeleteModal(classification)">
              Delete
            </button>
          </div>
        </div>

        <div class="parameters-section">
          <h4>Parameters ({{ classification.parameters?.length || 0 }})</h4>
          <div v-if="classification.parameters?.length" class="parameters-list">
            <div v-for="parameter in classification.parameters" :key="parameter.id" class="parameter-item">
              <span class="parameter-name">{{ parameter.name }}</span>
              <button class="action-button small danger" 
                      @click="openDeleteParameterModal(parameter, classification)">
                Delete
              </button>
            </div>
          </div>
          <div v-else class="no-parameters">
            No parameters yet. Add your first parameter!
          </div>
        </div>
      </div>
    </div>

    <!-- Create Classification Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Classification</h3>
          <button class="close-button" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Classification Name</label>
            <input 
              v-model="newClassificationName" 
              type="text" 
              placeholder="Enter classification name"
              @keyup.enter="handleCreateClassification"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showCreateModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleCreateClassification"
                  :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Classification Modal -->
    <div v-if="showRenameModal" class="modal-overlay" @click="showRenameModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Rename Classification</h3>
          <button class="close-button" @click="showRenameModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Classification Name</label>
            <input 
              v-model="renameClassificationData.name" 
              type="text" 
              placeholder="Enter new name"
              @keyup.enter="handleRenameClassification"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showRenameModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleRenameClassification"
                  :disabled="isRenaming">
            {{ isRenaming ? 'Renaming...' : 'Rename' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Classification Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Classification</h3>
          <button class="close-button" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the classification "{{ selectedDeleteClassification?.name }}"?</p>
          <p class="warning">This action cannot be undone and will also delete all associated parameters and champion data.</p>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="action-button danger" 
                  @click="handleDeleteClassification"
                  :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Parameter Modal -->
    <div v-if="showAddParameterModal" class="modal-overlay" @click="showAddParameterModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add Parameter to "{{ selectedClassification?.name }}"</h3>
          <button class="close-button" @click="showAddParameterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Parameter Name</label>
            <input 
              v-model="newParameterData.name" 
              type="text" 
              placeholder="Enter parameter name"
              @keyup.enter="handleAddParameter"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showAddParameterModal = false">Cancel</button>
          <button class="action-button primary" 
                  @click="handleAddParameter"
                  :disabled="isAddingParameter">
            {{ isAddingParameter ? 'Adding...' : 'Add Parameter' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Parameter Modal -->
    <div v-if="showDeleteParameterModal" class="modal-overlay" @click="showDeleteParameterModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Delete Parameter</h3>
          <button class="close-button" @click="showDeleteParameterModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the parameter "{{ deleteParameterData.name }}" from "{{ deleteParameterData.classification_name }}"?</p>
          <p class="warning">This action cannot be undone and will also delete all champion data for this parameter.</p>
        </div>
        <div class="modal-footer">
          <button class="action-button secondary" @click="showDeleteParameterModal = false">Cancel</button>
          <button class="action-button danger" 
                  @click="handleDeleteParameter"
                  :disabled="isDeletingParameter">
            {{ isDeletingParameter ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.classifications-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    color: #333;
  }
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 18px;
}

.classifications-list {
  display: grid;
  gap: 20px;
}

.classification-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.classification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #333;
  }
}

.classification-actions {
  display: flex;
  gap: 10px;
}

.parameters-section {
  h4 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
  }
}

.parameters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.parameter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.parameter-name {
  font-size: 14px;
  color: #333;
}

.no-parameters {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: background-color 0.2s;
  
  &.primary {
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }
  }
  
  &.secondary {
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
    }
  }
  
  &.danger {
    background-color: #dc3545;
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
  
  &.small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }
  }
}

.warning {
  color: #dc3545;
  font-weight: bold;
  font-size: 14px;
}
</style>